import React, { useEffect, useState } from 'react';
import { AppstoreOutlined, ContainerOutlined, DesktopOutlined, LinkOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Menu } from 'antd';
import type { MenuProps } from 'antd';
import './App.css';
import data from "./data.json";

type MenuItem = {
  label: string | React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

interface dataofJson{
  key:string;
  label:string;
}

const { Search } = Input;

const App: React.FC = () => {
  const [modifiedData, setModifiedData] = useState<MenuItem[]>([]);
  const [filteredData, setFilteredData] = useState<MenuItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [btn, setBtn] = useState<string | React.ReactNode>(''); 

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
      return items.map((item) => {
        let updatedItem = { ...item };
        const itemKey = item.key;
        let itemMatches = false;

        if (item.children) {
          const childResult = searchItems(item.children, [...parentKeys, itemKey]);

          if (childResult.length > 0) {
            updatedItem.children = childResult;
            itemMatches = true;
            openKeys.push(itemKey);
          }
        }

        if (typeof item.label === 'string' && item.label.toLowerCase().includes(query.toLowerCase())) {
          updatedItem.label = highlightText(item.label, query);
          itemMatches = true;
        }

        if (itemMatches || updatedItem.children) {
          openKeys.push(...parentKeys, itemKey);
        }

        return updatedItem;
      });
    };

    const resultItems = searchItems(items);
    return { items: resultItems, openKeys };
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
        setFilteredData(modifiedData); 
        setOpenKeys([]);
        // setBtn('');
      } else {
        setNotFound(false);
        setFilteredData(items);
        setOpenKeys(openKeys); 
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLElement || null;
    if (target && target.tagName === 'SPAN' && target.textContent) {
      setBtn(target.textContent);
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
    <div className="container">
    <div className="left" onClick={handleClick}>
    <Input
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
    </div>
      
      <div className='btn'>
      <span>{btn || "Click on a menu item to see the label here"}</span>
      </div>
    </div>
    
    </>
  );
};

export default App;
function setClickedLabel(textContent: any) {
  throw new Error('Function not implemented.');
}

