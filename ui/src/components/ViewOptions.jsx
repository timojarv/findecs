import React, { useState, useEffect } from "react";
import {
    Menu,
    MenuButton,
    Button,
    MenuList,
    MenuOptionGroup,
    MenuItemOption,
    MenuDivider,
    Flex,
} from "@chakra-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import { useAccess } from "../util/hooks";

const statuses = {
    all: "Kaikki",
    created: "Luotu",
    approved: "Hyväksytty",
    paid: "Maksettu",
    rejected: "Hylätty",
};

const ViewOptions = (props) => {
    const { onChange, disabledStatuses = [] } = props;

    const history = useHistory();
    const location = useLocation();
    const access = useAccess()
    const params = new URLSearchParams(location.search);
    const [author, setAuthor] = useState(params.get("author") || "all");
    const [status, setStatus] = useState(params.get("status") || "all");

    useEffect(() => {
        onChange({
            author,
            status,
        });

        const params = new URLSearchParams({ author, status });
        history.push({
            search: "?" + params.toString(),
        });
    }, [author, status, onChange]);

    return (
        <Flex>
            <Menu closeOnSelect={false}>
                <MenuButton mr={4} as={Button} rightIcon="chevron-down" display={access("admin")}>
                    Tekijä
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup
                        type="radio"
                        value={author}
                        onChange={setAuthor}
                    >
                        <MenuItemOption value="all">Kaikki</MenuItemOption>
                        <MenuItemOption value="self">Vain omat</MenuItemOption>
                    </MenuOptionGroup>
                </MenuList>
            </Menu>
            <Menu closeOnSelect={false}>
                <MenuButton as={Button} rightIcon="chevron-down">
                    Tila
                </MenuButton>
                <MenuList>
                    <MenuOptionGroup
                        type="radio"
                        value={status}
                        onChange={setStatus}
                    >
                        {Object.keys(statuses)
                            .filter((s) => !disabledStatuses.includes(s))
                            .map((s, i) => (
                                <MenuItemOption key={i} value={s}>
                                    {statuses[s]}
                                </MenuItemOption>
                            ))}
                    </MenuOptionGroup>
                </MenuList>
            </Menu>
        </Flex>
    );
};

export default ViewOptions;
