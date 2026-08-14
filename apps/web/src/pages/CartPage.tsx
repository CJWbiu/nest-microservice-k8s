import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Table,
  Typography,
  message,
  Space,
  Empty,
} from 'antd';
import { SHIPPING_FEE } from '@bookstore/shared';
import { useCart } from '../cart';
import { useAuth } from '../auth';
import { createSettlement } from '../api';
import { getAccount } from '../api';

export default function CartPage() {
  const { items, remove, setAmount, clear } = useCart();
  const { token, username } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.product.price) * i.amount,
    0,
  );
  const total = subtotal + (items.length ? SHIPPING_FEE : 0);

  const checkout = async () => {
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (!items.length) return;
    const values = await form.validateFields();
    setLoading(true);
    try {
      const payment = await createSettlement({
        items: items.map((i) => ({ id: i.product.id!, amount: i.amount })),
        purchase: {
          delivery: true,
          pay: values.pay || 'wechat',
          name: values.name,
          telephone: values.telephone,
          location: values.location,
        },
      });
      clear();
      message.success('结算单已创建');
      navigate(`/payment/${payment.payId}`, { state: { payment } });
    } catch (e: any) {
      message.error(e?.response?.data?.message || e.message || '结算失败');
    } finally {
      setLoading(false);
    }
  };

  const fillFromAccount = async () => {
    if (!username) return;
    try {
      const account = await getAccount(username);
      form.setFieldsValue({
        name: account.name,
        telephone: account.telephone,
        location: account.location,
      });
    } catch {
      /* ignore */
    }
  };

  if (!items.length) {
    return <Empty description="购物车是空的" />;
  }

  return (
    <div>
      <Typography.Title level={2}>购物车</Typography.Title>
      <Table
        rowKey={(r) => String(r.product.id)}
        pagination={false}
        dataSource={items}
        columns={[
          { title: '书名', dataIndex: ['product', 'title'] },
          {
            title: '单价',
            render: (_, r) => `¥${Number(r.product.price).toFixed(2)}`,
          },
          {
            title: '数量',
            render: (_, r) => (
              <InputNumber
                min={1}
                value={r.amount}
                onChange={(v) => setAmount(r.product.id!, v || 1)}
              />
            ),
          },
          {
            title: '小计',
            render: (_, r) => `¥${(Number(r.product.price) * r.amount).toFixed(2)}`,
          },
          {
            title: '操作',
            render: (_, r) => (
              <Button danger type="link" onClick={() => remove(r.product.id!)}>
                移除
              </Button>
            ),
          },
        ]}
      />
      <Typography.Paragraph style={{ marginTop: 16 }}>
        商品合计 ¥{subtotal.toFixed(2)} + 运费 ¥{SHIPPING_FEE.toFixed(2)} ={' '}
        <strong>¥{total.toFixed(2)}</strong>
      </Typography.Paragraph>

      <Typography.Title level={4}>配送信息</Typography.Title>
      <Form form={form} layout="vertical" style={{ maxWidth: 480 }} initialValues={{ pay: 'wechat' }}>
        <Form.Item name="name" label="收件人" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="telephone" label="电话" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="location" label="地址" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="pay" label="支付方式" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Space>
          <Button onClick={fillFromAccount}>从账户填充</Button>
          <Button type="primary" loading={loading} onClick={checkout}>
            提交结算
          </Button>
        </Space>
      </Form>
    </div>
  );
}
