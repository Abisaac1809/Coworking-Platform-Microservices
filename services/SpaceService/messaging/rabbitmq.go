package messaging

import (
	"context"
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQProducer struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

type espacioMessage struct {
	ID                   uint `json:"id"`
	NecesitaVerificacion bool `json:"necesita_verificacion"`
}

func NewRabbitMQProducer(amqpURL string) (*RabbitMQProducer, error) {
	conn, err := amqp.Dial(amqpURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	err = ch.ExchangeDeclare(
		"espacios",
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, err
	}

	return &RabbitMQProducer{conn: conn, channel: ch}, nil
}

func (p *RabbitMQProducer) Publish(routingKey string, spaceID uint, necesitaVerificacion bool) {
	body, err := json.Marshal(espacioMessage{
		ID:                   spaceID,
		NecesitaVerificacion: necesitaVerificacion,
	})
	if err != nil {
		log.Printf("RabbitMQ: failed to marshal message: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = p.channel.PublishWithContext(ctx,
		"espacios",
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	if err != nil {
		log.Printf("RabbitMQ: failed to publish message (key=%s): %v", routingKey, err)
		return
	}

	log.Printf("RabbitMQ: published message (key=%s, spaceID=%d, verificacion=%v)", routingKey, spaceID, necesitaVerificacion)
}

func (p *RabbitMQProducer) Close() {
	if p.channel != nil {
		p.channel.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
}
