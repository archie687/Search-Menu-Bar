import React, { useEffect, useState } from 'react';
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  LinkOutlined,
  MailOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Input, Menu } from 'antd';
import './App.css';
import data from './data.json';

type MenuItem = {
  label: string | React.ReactNode;
  key: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

const App: React.FC = () => {
  const [modifiedData, setModifiedData] = useState<MenuItem[]>([]);
  const [filteredData, setFilteredData] = useState<MenuItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [btn, setBtn] = useState<string | React.ReactNode>('');
  const [matchedPaths, setMatchedPaths] = useState<string[][]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
 

  const iconMap: { [key: string]: React.ReactNode } = {
    MailOutlined: <MailOutlined />,
    AppstoreOutlined: <AppstoreOutlined />,
    LinkOutlined: <LinkOutlined />,
    DesktopOutlined: <DesktopOutlined />,
    ContainerOutlined: <ContainerOutlined />,
  };



  const modifyJsonForAntd = () => {
    const completeData = data.map((element) => {
      if (element.icon) {
        return {
          ...element,
          icon: iconMap[element.icon],
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
        <span style={{ backgroundColor: 'yellow' }} key={i}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const searchTree = (
    items: MenuItem[],
    query: string
  ): { items: MenuItem[]; openKeys: string[]; paths: string[][] } => {
    const openKeys: string[] = [];
    let matchedPaths: string[][] = [];

    const searchItems = (items: MenuItem[], parentKeys: string[] = []): MenuItem[] => {
      return items.map((item) => {
        let updatedItem = { ...item };
        const itemKey = item.key;
        let itemMatches = false;

        const keyMatchesQuery =
          typeof item.key === 'string' && item.key.toLowerCase().includes(query.toLowerCase());
        const labelMatchesQuery =
          typeof item.label === 'string' && item.label.toLowerCase().includes(query.toLowerCase());

        if (item.children) {
          const childResult = searchItems(item.children, [...parentKeys, itemKey]);

          if (childResult.length > 0) {
            updatedItem.children = childResult;
            itemMatches = true;
            matchedPaths.push([...parentKeys, itemKey]); // Push parent path for matched child
          }
        }

        if (keyMatchesQuery || labelMatchesQuery) {
          openKeys.push(...parentKeys); // Expand parent nodes
          itemMatches = true;
          matchedPaths.push([...parentKeys, itemKey]); // Push matched path
        }

        if (labelMatchesQuery && typeof item.label === 'string') {
          updatedItem.label = highlightText(item.label, query); // Highlight matched text
        }

        return updatedItem;
      });
    };

    const resultItems = searchItems(items);
    return { items: resultItems, openKeys, paths: matchedPaths };
  };

  const onSearch = (value: string) => {
    if (value.trim() === '') {
      setFilteredData(modifiedData);
      setNotFound(false);
      setOpenKeys([]);
      setMatchedPaths([]);
    } else {
      const { items, openKeys, paths } = searchTree(modifiedData, value);
      if (items.length === 0) {
        setNotFound(true);
        setFilteredData(modifiedData);
        setOpenKeys([]);
        setMatchedPaths([]);
      } else {
        setNotFound(false);
        setFilteredData(items);
        setOpenKeys(openKeys);
        setMatchedPaths(paths);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = (e.target as HTMLElement) || null;
    if (target && target.tagName === 'SPAN' && target.textContent) {
      setBtn(target.textContent);
    }
  };

  const handleMenuItemClick = (itemKey: string, parentKeys: string[], itemLabel: string) => {
    // Find the matched path using itemKey and parentKeys in label format
    const fullPathLabels = [...parentKeys.map(key => findLabelByKey(key, modifiedData)), itemLabel]; // Include the clicked item label
    const formattedPath = fullPathLabels.join(' / ');
    console.log(`Path of clicked item: ${formattedPath}`);
    setSelectedPath(formattedPath); // Update state to display the path
  };

  // Helper function to find the label by key
  const findLabelByKey = (key: string, items: MenuItem[]): string => {
    for (const item of items) {
      if (item.key === key) {
        return typeof item.label === 'string' ? item.label : '';
      }
      if (item.children) {
        const foundLabel = findLabelByKey(key, item.children);
        if (foundLabel) return foundLabel;
      }
    }
    return '';
  };

  const renderMenuItems = (items: MenuItem[], parentKeys: string[] = []): React.ReactNode => {
    return items.map((item) => {
      const currentPath = [...parentKeys, item.key]; // Construct current path using keys

      if (item.children) {
        return (
          <Menu.SubMenu
            key={item.key}
            icon={item.icon}
            title={item.label}
            onTitleClick={() => handleMenuItemClick(item.key, parentKeys, typeof item.label === 'string' ? item.label : '')} // Update path on parent node click
          >
            {renderMenuItems(item.children, currentPath)} {/* Recursively render children */}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item
          key={item.key}
          icon={item.icon}
          onClick={() => handleMenuItemClick(item.key, parentKeys, typeof item.label === 'string' ? item.label : '')} // Pass the current path and label to the click handler
        >
          {item.label}
        </Menu.Item>
      );
    });
  };

  useEffect(() => {
    modifyJsonForAntd();
  }, []);

  const handleMenuOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <>
     {/* Display the selected path */}
     <div className="selected-path ">
          <span>
            {selectedPath ? `Path: ${selectedPath}` : "Path:"}
          </span>
        </div>
        <hr />
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
            openKeys={openKeys}
            onOpenChange={handleMenuOpenChange}
          >
            {renderMenuItems(filteredData)} {/* Render the menu items */}
          </Menu>


        </div>

        <div className="btn">
          <span>{btn || "Click on a menu item to see the label here"}</span>
        </div>

       
      </div>
    </>
  );
};

export default App;
