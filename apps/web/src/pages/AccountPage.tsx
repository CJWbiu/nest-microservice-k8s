import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, message } from 'antd';
import { AccountDto } from '@bookstore/shared';
import { useAuth } from '../auth';
import { getAccount } from '../api';

export default function AccountPage() {
  const { username } = useAuth();
  const [account, setAccount] = useState<AccountDto | null>(null);

  useEffect(() => {
    if (!username) return;
    getAccount(username)
      .then(setAccount)
      .catch((e) => message.error(e.message));
  }, [username]);

  if (!account) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <Card title="账户信息" style={{ maxWidth: 640, background: 'var(--panel)' }}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="用户名">{account.username}</Descriptions.Item>
        <Descriptions.Item label="姓名">{account.name}</Descriptions.Item>
        <Descriptions.Item label="电话">{account.telephone}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{account.email}</Descriptions.Item>
        <Descriptions.Item label="地址">{account.location}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
