import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Col, Descriptions, InputNumber, Row, Spin, Typography, message } from 'antd';
import { ProductDto } from '@bookstore/shared';
import { getProduct } from '../api';
import { useCart } from '../cart';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [amount, setAmount] = useState(1);
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getProduct(Number(id))
      .then(setProduct)
      .catch((e) => message.error(e.message));
  }, [id]);

  if (!product) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <Row gutter={32}>
      <Col xs={24} md={10}>
        <img
          src={product.cover}
          alt={product.title}
          style={{ width: '100%', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
        />
      </Col>
      <Col xs={24} md={14}>
        <Typography.Title level={2} style={{ fontFamily: 'Georgia, serif' }}>
          {product.title}
        </Typography.Title>
        <Typography.Title level={3} style={{ color: '#1a5f4a' }}>
          ¥{Number(product.price).toFixed(2)}
        </Typography.Title>
        <Typography.Paragraph>{product.description}</Typography.Paragraph>
        {product.specifications && product.specifications.length > 0 && (
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
            {product.specifications.map((s) => (
              <Descriptions.Item key={s.id || s.item} label={s.item}>
                {s.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <InputNumber min={1} value={amount} onChange={(v) => setAmount(v || 1)} />
          <Button
            type="primary"
            size="large"
            onClick={() => {
              add(product, amount);
              message.success('已加入购物车');
              navigate('/cart');
            }}
          >
            加入购物车
          </Button>
        </div>
      </Col>
    </Row>
  );
}
