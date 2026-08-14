import { Button, Card, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Card style={{ maxWidth: 480, margin: '40px auto', background: 'var(--panel)' }}>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        注册
      </Typography.Title>
      <Form
        layout="vertical"
        onFinish={async (values) => {
          try {
            await register(values);
            message.success('注册成功，请登录');
            navigate('/login');
          } catch (e: any) {
            message.error(e?.response?.data?.message || '注册失败');
          }
        }}
      >
        <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true, min: 6 }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="telephone" label="手机">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="邮箱">
          <Input />
        </Form.Item>
        <Form.Item name="location" label="地址">
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          注册
        </Button>
      </Form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        已有账号？<Link to="/login">登录</Link>
      </div>
    </Card>
  );
}
