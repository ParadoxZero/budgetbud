import React from "react";
import { Modal, Input, Select, Button, Form } from "antd";

export interface AddExpenseModalProps {
  isOpen: boolean;
  categories: { id: number; name: string }[];
  defaultCategoryId: number;
  defaultAmount: number;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (title: string, amount: number, categoryId: number) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  categories,
  defaultCategoryId,
  defaultAmount,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values.title, values.amount, values.categoryId);
        form.resetFields();
      })
      .catch((info) => {
        console.error("Validation Failed:", info);
      });
  };
  return (
    <Modal
      title="Add Expense"
      open={isOpen}
      loading={isLoading}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Add
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ categoryId: defaultCategoryId, amount: defaultAmount }}>
        <Form.Item
          label="Category"
          name="categoryId"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: false, message: "Please enter a title for the expense" }]}
        >
          <Input placeholder="Expense Title" />
        </Form.Item>
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <Input type="number" placeholder="Expense Amount" />
        </Form.Item>

      </Form>
    </Modal>
  );
};
