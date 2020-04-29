import React, { useState, useContext } from "react";
import { Link, Redirect } from "react-router-dom";

import {
    Flex,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Image,
} from "@chakra-ui/core";
import { Menu as Hamburger, X } from "react-feather";
import FindecsLogo from "../resources/logo.svg";
import { AuthContext } from "../util/auth";

const NavItem = (props) => (
    <Button variant="ghost" to={props.to} as={Link} mt={[1, 0]}>
        {props.children}
    </Button>
);

const Navigation = (props) => {
    const path = props.location.pathname;

    const [open, setOpen] = useState(false);
    const handleToggle = () => setOpen(!open);

    const user = useContext(AuthContext);

    if (path.endsWith("print") || path.endsWith("login")) {
        return null;
    }

    if (!user.name && !props.isAuthenticating) {
        return <Redirect to="/login" />;
    }

    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            py={2}
            px={[3, 8]}
            borderBottom="1px"
            borderColor="gray.200"
            {...props}
        >
            <Flex align="center" mx={3}>
                <Image as={FindecsLogo} size={12} />
            </Flex>

            <Box
                cursor="pointer"
                display={["block", "none"]}
                onClick={handleToggle}
            >
                {open ? <X /> : <Hamburger />}
            </Box>

            <Box
                display={[open ? "flex" : "none", "flex"]}
                width={["full", "auto"]}
                alignItems="center"
                flexGrow={1}
                flexDirection={["column", "row"]}
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
                        <MenuItem as={Link} to="/contacts">
                            Yhteystiedot
                        </MenuItem>
                        <MenuItem as={Link} to="/users">
                            Käyttäjät
                        </MenuItem>
                        <MenuItem as={Link} to="/import">
                            Tuo tietoja
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Box margin="auto" display={[open ? "block" : "none", "flex"]}>
                <Menu>
                    <MenuButton
                        as={Button}
                        mt={[1, 0]}
                        variant="ghost"
                        rightIcon="chevron-down"
                    >
                        {user.name || "Tuntematon"}
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/settings">
                            Asetukset
                        </MenuItem>
                        <MenuItem onClick={() => user.setToken(null)}>
                            Kirjaudu ulos
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default Navigation;
