package org.seckill.exception;

/**
 * String 事物只接受运行期异常的策略
 * 重复秒杀异常（运行期异常）
 */
public class RepeatKillException extends SeckillException{
    public RepeatKillException(String message) {
        super(message);
    }

    public RepeatKillException(String message, Throwable cause) {
        super(message, cause);
    }
}
