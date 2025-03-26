import { Kafka } from "kafkajs";

export class KafkaClient {
    private static instance: Kafka;

    private constructor() { }

    public static getInstance(): Kafka {
        if (!this.instance) {
            this.instance = new Kafka({
                clientId: process.env.KAFKA_CLIENT_ID,
                brokers: [process.env.KAFKA_BROKER!],
                ssl: process.env.KAFKA_SSL === "true",
                sasl: {
                    mechanism: "plain",
                    username: process.env.KAFKA_API_KEY as string,
                    password: process.env.KAFKA_API_SECRET as string,
                },
                connectionTimeout: 10000,
            });
        }
        return this.instance;
    }
}