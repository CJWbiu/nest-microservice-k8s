import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 420, margin: '40px auto', background: 'var(--panel)' }}>
      <Typography.Title level={3} style={{ textAlign: 'center', fontFamily: 'Georgia, serif' }}>
        登录 Bookstore
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
        演示账号 icyfenix / 123456
      </Typography.Paragraph>
      <Form
        layout="vertical"
        onFinish={async (values) => {
          try {
            await login(values.username, values.password);
            message.success('登录成功');
            navigate('/');
          } catch (e: any) {
            message.error(e?.response?.data?.message || '登录失败');
          }
        }}
      >
        <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          登录
        </Button>
      </Form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        没有账号？<Link to="/register">注册</Link>
      </div>
    </Card>
  );
}
