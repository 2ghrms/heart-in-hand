package com.sg25.spring_server.global.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String RESULT_QUEUE = "note.analyze.result";
    public static final String EXCHANGE_NAME = "note.exchange";
    public static final String RESULT_ROUTING_KEY = "note.analyze.result";

    // 분석 결과 수신 큐 (AI → Spring)
    @Bean
    public Queue resultQueue() {
        return new Queue(RESULT_QUEUE, true);
    }

    // Direct Exchange 선언
    @Bean
    public DirectExchange noteExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    // 결과 수신 큐 바인딩
    @Bean
    public Binding resultBinding(Queue resultQueue, DirectExchange noteExchange) {
        return BindingBuilder.bind(resultQueue).to(noteExchange).with(RESULT_ROUTING_KEY);
    }

    // JSON 직렬화 컨버터
    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate에 JSON 컨버터 연결 (확장성 고려하여 MQ 전송시에 사용 가능)
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
