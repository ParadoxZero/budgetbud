/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2026  Sidhin S Thomas <sidhin.thomas@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Button,
  Flex,
  Switch,
  message,
} from "antd";
import {
  LeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import { DataService, getDataService } from "../services/data_service";
import { Budget, GroupCategoryEditRow } from "../datamodel/datamodel";
import { useDispatch } from "react-redux";
import { budgetSlice, navigate, View } from "../store";

interface DraggableTableBodyRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string;
}

const DraggableTableBodyRow: React.FC<DraggableTableBodyRowProps> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props["data-row-key"],
    });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: "move",
  };

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

interface EditCategoriesPageProps {
  budget: Budget;
}

const EditCategoriesPage: React.FC<EditCategoriesPageProps> = ({
  budget,
}) => {
  const [dataSource, setDataSource] = useState<GroupCategoryEditRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const _data_service: DataService = getDataService();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  useEffect(() => {
    const initialData: GroupCategoryEditRow[] = budget.categoryList.map(
      (cat, index) => ({
        row_key: index,
        id: cat.id,
        title: cat.name,
        amount: cat.allocation,
        isSingleType: cat.isSingleType,
      }),
    );
    setDataSource(initialData);
  }, [budget]);

  const handleRowChange = (
    id: number | null,
    field: keyof GroupCategoryEditRow,
    value: any,
  ) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => item.row_key === id);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, [field]: value });
      setDataSource(newData);
    }
  };

  const handleAddRow = () => {
    const newRow: GroupCategoryEditRow = {
      row_key: dataSource.length + 1,
      id: null,
      title: "",
      amount: 0,
    };
    setDataSource([...dataSource, newRow]);
  };

  const handleDeleteRow = (id: number | null) => {
    const newData = dataSource.filter((item) => item.row_key !== id);
    setDataSource(newData);
  };

  const handleBulkSave = async () => {
    setLoading(true);
    try {
      const updatedBudget = await _data_service.bulkUpdateCategories(
        budget.id,
        dataSource, 
      );
      dispatch(budgetSlice.actions.updateCurrent(updatedBudget));
      message.success("Categories updated successfully!");
    } catch (error) {
      message.error("Failed to update categories.");
      console.error("Bulk save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource((previous) => {
        const activeIndex = previous.findIndex((item) => item.row_key === active.id);
        const overIndex = previous.findIndex((item) => item.row_key === over?.id);
        return arrayMove(previous, activeIndex, overIndex);
      });
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      width: "50%",
      render: (_: any, record: GroupCategoryEditRow) => (
        <Input
          value={record.title}
          onChange={(e) => handleRowChange(record.row_key, "title", e.target.value)}
        />
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: "30%",
      render: (_: any, record: GroupCategoryEditRow) => (
        <InputNumber
          value={record.amount}
          onChange={(value) => handleRowChange(record.row_key, "amount", value)}
        />
      ),
    },
    {
      title: "Type",
      dataIndex: "isSingleType",
      width: "20%",
      render: (_: any, record: GroupCategoryEditRow) => (
        <Switch
          checkedChildren="Single"
          unCheckedChildren="List"
          checked={record.isSingleType ?? false}
          onChange={(checked) =>
            handleRowChange(record.row_key, "isSingleType", checked)
          }
        />
      ),
    },
    {
      title: "Operation",
      dataIndex: "operation",
      render: (_: any, record: GroupCategoryEditRow) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => handleDeleteRow(record.row_key)}
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  const on_back_click = () => {
    dispatch(navigate(View.Overview));
  };

  return (
    <Flex vertical align="center" justify="center">
      <Flex align="center" justify="center" gap={10} wrap style={{ margin: 20 }}>
        <Button
          shape="default"
          type="primary"
          icon={<LeftOutlined />}
          onClick={on_back_click}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRow}
          disabled={loading}
        >
          Add Row
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleBulkSave}
          loading={loading}
        >
          Save All Changes
        </Button>
      </Flex>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={dataSource.map((item) => item.row_key)}
          strategy={verticalListSortingStrategy}
        >
          <Table
            components={{
              body: {
                row: DraggableTableBodyRow,
              },
            }}
            bordered
            dataSource={dataSource}
            columns={columns}
            rowClassName="editable-row"
            pagination={false}
            rowKey={(record) => record.row_key}
          />
        </SortableContext>
      </DndContext>
    </Flex>
  );
};

export default EditCategoriesPage;

