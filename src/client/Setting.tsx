import React, { useCallback, useEffect } from 'react';
import { useAPIClient, useCompile, useRequest } from '@nocobase/client';
import { Button, Card, Form, Input, message } from 'antd';
import { resourceKey } from '../constants';

export const Setting = () => {
  const apiClient = useAPIClient();

  const [form] = Form.useForm();

  useEffect(() => {
    apiClient
      .resource(resourceKey)
      .get({})
      .then((res) => {
        form.setFieldsValue(res.data?.data || {});
      })
      .catch((err) => {
        console.log(err);
        message.error('获取配置失败');
      });
  }, [apiClient, form]);

  const onSubmit = useCallback(
    (values) => {
      console.log('values', values);
      apiClient
        .resource(resourceKey)
        .set(values)
        .then((res) => {
          message.success('保存成功');
        })
        .catch((err) => {
          message.error('保存失败');
        });
    },
    [apiClient],
  );

  return (
    <Card title={'微信小程序开发者ID设置'} bordered={false}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item required name="appid" label={'AppID(小程序ID)'}>
          <Input />
        </Form.Item>
        <Form.Item required name="secret" label={'AppSecret(小程序密钥)'}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
