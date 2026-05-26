FROM rust:1.85-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app

# Create an empty project shell to cache dependency layers
RUN cargo new --bin reservation-service
WORKDIR /app/reservation-service

COPY Cargo.toml Cargo.lock* ./

# Build the empty project to fetch and compile dependencies (cached unless Cargo.toml changes)
RUN cargo build --release

# Remove the dummy source files and build artifacts matching the project binary
RUN rm src/*.rs
RUN rm -f target/release/deps/ReservationService* target/release/deps/reservation_service*

COPY src ./src

RUN cargo build --release

FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/reservation-service/target/release/ReservationService .

EXPOSE 8000

# Run the binary
CMD ["./ReservationService"]
