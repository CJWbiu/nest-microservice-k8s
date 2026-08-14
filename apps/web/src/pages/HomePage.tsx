import { useEffect, useState } from 'react';
import { Carousel, Col, Row, Card, Typography, Rate, Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { AdvertisementDto, ProductDto } from '@bookstore/shared';
import { listAds, listProducts } from '../api';

export default function HomePage() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [ads, setAds] = useState<AdvertisementDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listProducts(), listAds()])
      .then(([p, a]) => {
        setProducts(p);
        setAds(a);
      })
      .catch((e) => message.error(e.message || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;

  return (
    <div>
      {ads.length > 0 && (
        <Carousel autoplay style={{ marginBottom: 28, borderRadius: 12, overflow: 'hidden' }}>
          {ads.map((ad) => (
            <div key={ad.id}>
              <Link to={`/products/${ad.productId}`}>
                <img
                  src={ad.image}
                  alt="ad"
                  style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                />
              </Link>
            </div>
          ))}
        </Carousel>
      )}

      <Typography.Title level={2} style={{ fontFamily: 'Georgia, serif', marginBottom: 8 }}>
        精选书单
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        浏览商品、加入购物车，完成结算与支付闭环。
      </Typography.Paragraph>

      <Row gutter={[20, 20]}>
        {products.map((p) => (
          <Col xs={24} sm={12} md={8} lg={6} key={p.id}>
            <Link to={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                cover={
                  <img
                    alt={p.title}
                    src={p.cover}
                    style={{ height: 220, objectFit: 'cover' }}
                  />
                }
                styles={{ body: { background: 'var(--panel)' } }}
              >
                <Card.Meta
                  title={p.title}
                  description={
                    <div>
                      <Rate disabled allowHalf value={(p.rate || 0) / 2} style={{ fontSize: 12 }} />
                      <div style={{ marginTop: 8, color: '#1a5f4a', fontWeight: 600 }}>
                        ¥{Number(p.price).toFixed(2)}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
