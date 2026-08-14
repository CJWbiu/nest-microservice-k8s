import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Spin, Typography } from 'antd';
import {
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useAuth } from './auth';
import { CartProvider, useCart } from './cart';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

const { Header, Content, Footer } = Layout;

function Shell() {
  const { token, username, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: 'rgba(28, 43, 36, 0.92)',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography.Title
          level={3}
          style={{ color: '#f4efe4', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: 1 }}
        >
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Fenix's Bookstore
          </Link>
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectable={false}
          style={{ flex: 1, background: 'transparent', minWidth: 0 }}
          items={[
            { key: 'home', icon: <BookOutlined />, label: <Link to="/">书架</Link> },
            {
              key: 'cart',
              icon: <ShoppingCartOutlined />,
              label: <Link to="/cart">购物车 ({items.length})</Link>,
            },
            ...(token
              ? [{ key: 'account', icon: <UserOutlined />, label: <Link to="/account">账户</Link> }]
              : []),
          ]}
        />
        <Space>
          {token ? (
            <>
              <span style={{ color: '#d9e5df' }}>{username}</span>
              <Button
                icon={<LogoutOutlined />}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                退出
              </Button>
            </>
          ) : (
            <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '64px 0',
              }}
            >
              <Spin size="large" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={token ? <AccountPage /> : <Navigate to="/login" />} />
            <Route path="/payment/:payId" element={<PaymentPage />} />
          </Routes>
        </Suspense>
      </Content>
      <Footer style={{ textAlign: 'center', background: 'transparent', color: '#5a6b62' }}>
        NestJS 复刻 · Fenix Bookstore · Kubernetes Microservices
      </Footer>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Shell />
      </CartProvider>
    </BrowserRouter>
  );
}
