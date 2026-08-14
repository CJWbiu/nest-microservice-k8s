import { useLocation, useParams } from 'react-router-dom';
import { Button, Card, Result, Space, Typography, message } from 'antd';
import { useState } from 'react';
import { PaymentDto, PaymentState } from '@bookstore/shared';
import { updatePayment } from '../api';

export default function PaymentPage() {
  const { payId } = useParams();
  const location = useLocation();
  const payment = (location.state as { payment?: PaymentDto } | null)?.payment;
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const act = async (state: PaymentState) => {
    if (!payId) return;
    setLoading(true);
    try {
      await updatePayment(payId, state);
      setDone(true);
      message.success(state === PaymentState.PAYED ? '支付成功' : '已取消');
    } catch (e: any) {
      message.error(e?.response?.data?.message || e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <Result status="success" title="支付单已处理" />;
  }

  return (
    <Card style={{ maxWidth: 560, margin: '0 auto', background: 'var(--panel)' }}>
      <Typography.Title level={3}>待支付订单</Typography.Title>
      <Typography.Paragraph>支付单号：{payId}</Typography.Paragraph>
      {payment && (
        <>
          <Typography.Paragraph>
            金额：<strong>¥{Number(payment.totalPrice).toFixed(2)}</strong>
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            请在 {Math.round(Number(payment.expires) / 1000 / 60)} 分钟内完成支付，超时将自动解冻库存。
          </Typography.Paragraph>
        </>
      )}
      <Space>
        <Button type="primary" loading={loading} onClick={() => act(PaymentState.PAYED)}>
          确认支付
        </Button>
        <Button danger loading={loading} onClick={() => act(PaymentState.CANCEL)}>
          取消订单
        </Button>
      </Space>
    </Card>
  );
}
