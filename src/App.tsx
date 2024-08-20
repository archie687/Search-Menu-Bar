import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, ContainerOutlined, DesktopOutlined, LinkOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Menu } from 'antd';
import './App.css';
import data from "./data.json";

type MenuItem = {
  label: string | React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const { Search } = Input;

const App: React.FC = () => {
  const [modifiedData, setModifiedData] = useState<MenuItem[]>([]);
  const [filteredData, setFilteredData] = useState<MenuItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const iconMap: { [key: string]: React.ReactNode } = {
    MailOutlined: <MailOutlined />,
    AppstoreOutlined: <AppstoreOutlined />,
    LinkOutlined: <LinkOutlined />,
    DesktopOutlined: <DesktopOutlined />,
    ContainerOutlined: <ContainerOutlined />
  };

  const modifyJsonForAntd = () => {
    const completeData = data.map((element) => {
      if (element.icon) {
        return {
          ...element,
          icon: iconMap[element.icon]
        };
      }
      return element;
    });
    setModifiedData(completeData);
    setFilteredData(completeData);
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span style={{ backgroundColor: 'yellow' }} key={i}>{part}</span>
      ) : (
        part
      )
    );
  };

  const searchTree = (
    items: MenuItem[],
    query: string
  ): { items: MenuItem[]; openKeys: string[] } => {
    const openKeys: string[] = [];

    const searchItems = (items: MenuItem[], parentKeys: string[] = []): MenuItem[] => {
      return items.reduce((result: MenuItem[], item) => {
        let updatedItem = { ...item };
        const itemKey = item.key;

        if (item.children) {
          const childResult = searchItems(item.children, [...parentKeys, itemKey]);

          if (childResult.length > 0 || (typeof item.label === 'string' && item.label.toLowerCase().includes(query.toLowerCase()))) {
            openKeys.push(itemKey);
            updatedItem = { 
              ...updatedItem, 
              children: childResult,
              label: typeof item.label === 'string' && item.label.toLowerCase().includes(query.toLowerCase())
                ? highlightText(item.label, query)
                : item.label
            };
          } else {
            updatedItem = { 
              ...updatedItem, 
              children: undefined 
            };
          }
        } else if (typeof item.label === 'string' && item.label.toLowerCase().includes(query.toLowerCase())) {
          updatedItem.label = highlightText(item.label, query);
          openKeys.push(...parentKeys);
        }

        if (updatedItem.children || typeof updatedItem.label === 'string' && updatedItem.label.toLowerCase().includes(query.toLowerCase())) {
          result.push(updatedItem);
        }

        return result;
      }, []);
    };

    return { items: searchItems(items), openKeys };
  };

  const onSearch = (value: string) => {
    if (value.trim() === '') {
      setFilteredData(modifiedData);
      setNotFound(false);
      setOpenKeys([]);
    } else {
      const { items, openKeys } = searchTree(modifiedData, value);
      if (items.length === 0) {
        setNotFound(true);
        setFilteredData([]);
      } else {
        setNotFound(false);
        setFilteredData(items);
        setOpenKeys(openKeys);
      }
    }
  };

  useEffect(() => {
    modifyJsonForAntd();
  }, []);

  const handleMenuOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <>
      <Search
        prefix={<SearchOutlined />}
        placeholder="search text"
        style={{ width: 257 }}
        onChange={(e) => onSearch(e.target.value)}
        suffix={notFound ? <span style={{ color: '#ccc' }}> Not Found </span> : null}
      />

      <Menu
        style={{ width: 256 }}
        mode="inline"
        items={filteredData}
        onOpenChange={handleMenuOpenChange}
        openKeys={openKeys}
      />
    </>
  );
};

export default App;
