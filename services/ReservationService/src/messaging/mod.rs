use lapin::{
    options::{
        BasicAckOptions, BasicConsumeOptions, ExchangeDeclareOptions, QueueBindOptions,
        QueueDeclareOptions,
    },
    types::FieldTable,
    ExchangeKind,
};
use sqlx::PgPool;

use crate::repositories::espacio_verificacion_repository::EspacioVerificacionRepository;
use crate::traits::EspacioVerificacionRepositoryTrait;

pub async fn start_consumer(amqp_url: String, pool: PgPool) {
    let conn = loop {
        match lapin::Connection::connect(&amqp_url, lapin::ConnectionProperties::default()).await {
            Ok(c) => break c,
            Err(e) => {
                eprintln!("RabbitMQ connection failed: {}, retrying in 5s...", e);
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
            }
        }
    };

    let channel = conn.create_channel().await.expect("Failed to create channel");

    channel
        .exchange_declare(
            "espacios",
            ExchangeKind::Topic,
            ExchangeDeclareOptions {
                durable: true,
                ..Default::default()
            },
            FieldTable::default(),
        )
        .await
        .expect("Failed to declare exchange");

    channel
        .queue_declare(
            "reservas.espacio_events",
            QueueDeclareOptions {
                durable: true,
                ..Default::default()
            },
            FieldTable::default(),
        )
        .await
        .expect("Failed to declare queue");

    for key in &["espacio.creado", "espacio.actualizado"] {
        channel
            .queue_bind(
                "reservas.espacio_events",
                "espacios",
                key,
                QueueBindOptions::default(),
                FieldTable::default(),
            )
            .await
            .expect("Failed to bind queue");
    }

    let consumer = channel
        .basic_consume(
            "reservas.espacio_events",
            "reservation-service-consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .expect("Failed to start consumer");

    println!("RabbitMQ consumer started, listening for space events...");

    let ev_repo = EspacioVerificacionRepository::new(pool);

    use futures_lite::StreamExt;
    let mut consumer = consumer;
    while let Some(delivery_result) = consumer.next().await {
        match delivery_result {
            Ok(delivery) => {
                if let Ok(payload) = std::str::from_utf8(&delivery.data) {
                    if let Ok(msg) = serde_json::from_str::<serde_json::Value>(payload) {
                        let espacio_id = msg
                            .get("id")
                            .and_then(|v| v.as_i64())
                            .map(|v| v as i32);
                        let necesita = msg
                            .get("necesita_verificacion")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false);

                        if let Some(id) = espacio_id {
                            if let Err(e) = ev_repo.upsert(id, necesita).await {
                                eprintln!("Failed to upsert espacio_verificacion: {}", e);
                            }
                        }
                    }
                }
                let _ = delivery.ack(BasicAckOptions::default()).await;
            }
            Err(e) => {
                eprintln!("RabbitMQ consumer error: {}", e);
            }
        }
    }
}
