import React, { useContext, useEffect, useState } from 'react';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarFooter,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';
import { AccountContext } from './Provider';
import { checkOwner } from './utils/contractUtilities';

const Sidebar = () => {
  const { account } = useContext(AccountContext);
  const [show, setShow] = useState(false);

  const isOwner = async () => {
    if (account) {
      const owner = await checkOwner(account);
      setShow(owner);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    isOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div
      style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}
    >
      <CDBSidebar textColor='#fff' backgroundColor='#333'>
        <CDBSidebarHeader prefix={<i className='fa fa-bars fa-large'></i>}>
          <a
            href='/'
            className='text-decoration-none'
            style={{ color: 'inherit' }}
          >
            Vote-Chain
          </a>
        </CDBSidebarHeader>

        <CDBSidebarContent className='sidebar-content'>
          <CDBSidebarMenu>
            <NavLink to='/' activeclassname='activeClicked'>
              <CDBSidebarMenuItem icon='chart-line'>
                Dashboard
              </CDBSidebarMenuItem>
            </NavLink>
            <NavLink to='/profile' activeclassname='activeClicked'>
              <CDBSidebarMenuItem icon='user'>Profile</CDBSidebarMenuItem>
            </NavLink>
            <NavLink to='/add' activeclassname='activeClicked'>
              {show && (
                <CDBSidebarMenuItem icon='plus'>Add Party</CDBSidebarMenuItem>
              )}
            </NavLink>
            <NavLink to='/search' activeclassname='activeClicked'>
              <CDBSidebarMenuItem icon='search'>Search</CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <CDBSidebarFooter style={{ textAlign: 'center' }}>
          <div
            style={{
              padding: '20px 5px',
            }}
          >
            Vote-Chain v1.0.0
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>
    </div>
  );
};

export default Sidebar;
