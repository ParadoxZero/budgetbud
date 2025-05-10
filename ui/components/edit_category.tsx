import React from "react";
import { Button, Input, Flex } from "antd";
import { CloseOutlined, LoadingOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";

interface EditCategoryProps {
  context: {
    category_id: number;
    amount: number;
    filled: boolean;
    processing: boolean;
    isModalOpen: boolean;
  } | null;
  onAddExpense: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModalRequested: () => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({
  context,
  onAddExpense,
  onInputChange,
  onModalRequested,
}) => {
  let feature_button_icon = <CloseOutlined />;
  if (context?.processing) {
    feature_button_icon = <LoadingOutlined />;
  } else if (context?.filled) {
    feature_button_icon = <PlusOutlined />;
  }

  return (
    <div
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: 300,
      }}
      className="touchahble"
    >
      <Flex align="center" justify="space-between" style={{ minHeight: 80 }}>
        <Input
          id="expense_amount"
          size="large"
          type="number"
          placeholder="Spent amount"
          autoFocus
          variant="borderless"
          minLength={250}
          inputMode="numeric"
          style={{ padding: 0 }}
          onPressEnter={onAddExpense}
          onInput={onInputChange}
          disabled={context?.processing}
        />
        <Flex align="center" justify="right">
          <Button
            shape="circle"
            type="default"
            icon={feature_button_icon}
            style={{ padding: 20, marginLeft: 20 }}
            onClick={onAddExpense}
          ></Button>
          <Button
            shape="circle"
            type="default"
            icon={<RightOutlined />}
            style={{ padding: 20, marginLeft: 20 }}
            disabled={context?.isModalOpen || false}
            onClick={onModalRequested}
          ></Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default EditCategory;
