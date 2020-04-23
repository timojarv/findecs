import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Flex,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Image,
} from '@chakra-ui/core';
import { Menu as Hamburger, X } from 'react-feather';

const NavItem = (props) => (
    <Button variant="ghost" to={props.to} as={Link} mt={[1, 0]}>
        {props.children}
    </Button>
);

const Navigation = (props) => {
    const [open, setOpen] = useState(false);
    const handleToggle = () => setOpen(!open);

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            py={3}
            px={[3, 8]}
            borderBottom="1px"
            borderColor="gray.200"
            {...props}
        >
            <Flex align="center" mx={3}>
                <Image
                    src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/241/money-with-wings_1f4b8.png"
                    size={10}
                />
            </Flex>

            <Box
                cursor="pointer"
                display={['block', 'none']}
                onClick={handleToggle}
            >
                {open ? <X /> : <Hamburger />}
            </Box>

            <Box
                display={[open ? 'flex' : 'none', 'flex']}
                width={['full', 'auto']}
                alignItems="center"
                flexGrow={1}
                flexDirection={['column', 'row']}
            >
                <NavItem to="/costClaims">Kulukorvaukset</NavItem>
                <NavItem to="/purchaseInvoices">Ostolaskut</NavItem>
                <NavItem to="/salesInvoices">Myyntilaskut</NavItem>
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon="chevron-down"
                        mt={[1, 0]}
                    >
                        Hallinta
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/costPools">
                            Kustannuspaikat
                        </MenuItem>
                        <MenuItem as={Link} to="/users">
                            Käyttäjät
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Box margin="auto" display={[open ? 'block' : 'none', 'flex']}>
                <Menu>
                    <MenuButton
                        as={Button}
                        mt={[1, 0]}
                        variant="ghost"
                        rightIcon="chevron-down"
                    >
                        Timo Järventausta
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/settings">
                            Asetukset
                        </MenuItem>
                        <MenuItem as={Link} to="/logout">
                            Kirjaudu ulos
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default Navigation;
