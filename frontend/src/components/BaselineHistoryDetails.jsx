import React from 'react';
import { Typography } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { sampleBaseline } from '../data/sampleData';

const { Paragraph } = Typography;

/**
 * BaselineHistoryDetails renders a read-only table of baseline tasks
 * associated with a historical measurement.  It also shows summary
 * statistics identical to BaselineDetails but without editing or
 * submission controls.
 *
 * @param {number[]} baselineIds - list of baseline IDs to display.
 */
const BaselineHistoryDetails = ({ baselineIds }) => {
  const dataSource = baselineIds
    .map((id) => sampleBaseline.find((b) => b.id === id))
    .filter(Boolean)
    .map((item) => ({ ...item }));
  const columns = [
    { title: '序号', dataIndex: 'id' },
    { title: '动力配置', dataIndex: 'powerConfig' },
    { title: '一级任务', dataIndex: 'name' },
    { title: '改动类型', dataIndex: 'type' },
    { title: '具体事项', dataIndex: 'matter' },
    { title: '工时', dataIndex: 'hours' },
    { title: '月数', dataIndex: 'months' },
  ];
  const totalHours = dataSource.reduce((sum, item) => sum + (item?.hours || 0), 0);
  const configSet = new Set();
  const configMonths = {};
  dataSource.forEach((item) => {
    const cfg = item.powerConfig;
    configSet.add(cfg);
    configMonths[cfg] = (configMonths[cfg] || 0) + (item.months || 0);
  });
  return (
    <div>
      <ProTable
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        search={false}
        options={false}
        pagination={false}
      />
      <Paragraph style={{ marginTop: 16 }}>
        共查询到 {dataSource.length} 条基准任务工时记录；总目标工时合计:{totalHours} 工时；动力配置总数: {configSet.size} 种；日程月数:
        {Object.entries(configMonths)
          .map(([cfg, months]) => `${cfg}${months}个月`)
          .join('，')}
        。
      </Paragraph>
    </div>
  );
};

export default BaselineHistoryDetails;