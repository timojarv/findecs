import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
import { useMutation } from "urql";
import { useMessage } from "../util/message";
import { useAccess } from "../util/hooks";

const mutation = `
    mutation Logout {
        logout
    }
`;

const NavItem = (props) => (
    <Button
        as={Link}
        to={props.to}
        variant="ghost"
        mt={[1, 0]}
        mr={[0, 2]}
        variantColor={props.path.startsWith(props.to) ? "indigo" : undefined}
    >
        {props.children}
    </Button>
);

const Navigation = (props) => {
    const { user, setUser } = props;
    const path = props.location.pathname;

    const [open, setOpen] = useState(false);
    const [_, logout] = useMutation(mutation);
    const { infoMessage } = useMessage();
    const access = useAccess();

    const handleToggle = () => setOpen(!open);

    const handleLogout = () => {
        logout().then(() => {
            setUser(null);
            infoMessage("Kirjauduttu ulos");
        });
    };

    if (path.endsWith("print")) {
        return null;
    }

    useEffect(() => {
        setOpen(false);
    }, [path]);

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
            <Flex as={Link} to="/" align="center" mx={3}>
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
                <NavItem path={path} to="/costClaims">
                    Kulukorvaukset
                </NavItem>
                <NavItem path={path} to="/purchaseInvoices">
                    Ostolaskut
                </NavItem>
                <NavItem path={path} to="/salesInvoices">
                    Myyntilaskut
                </NavItem>
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon="chevron-down"
                        mt={[1, 0]}
                        display={access("admin")}
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
                        {user.name}
                    </MenuButton>
                    <MenuList>
                        <MenuItem as={Link} to="/settings">
                            Asetukset
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            Kirjaudu ulos
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};

export default Navigation;
