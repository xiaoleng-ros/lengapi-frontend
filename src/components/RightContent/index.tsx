import { QuestionCircleOutlined } from '@ant-design/icons';
// @ts-ignore
import { SelectLang as UmiSelectLang } from '@umijs/max'; // 将导入的组件重命名为 UmiSelectLang

export type SiderTheme = 'light' | 'dark';

/**
 * 语言选择器组件
 * 使用 UmiSelectLang 组件来实现多语言切换功能
 */
export const LanguageSwitcher = () => {
  return <UmiSelectLang />;
};

/**
 * 问题帮助组件
 * 点击后跳转到 Ant Design Pro 的文档页面
 */
export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};
