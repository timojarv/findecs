import React from "react";
import TimeLine from "./TimeLine";
import { Circle, Clock, CheckCircle, ArrowRightCircle } from "react-feather";
import { Box, Button } from "@chakra-ui/core";

export default {
    title: "TimeLine",
};

const steps = [
    {
        icon: Circle,
        title: "Kulukorvaus luotu",
        datetime: "12.5.2020",
        comment: "Muokattu 13.4.2020 klo 13.46",
    },
    {
        icon: CheckCircle,
        title: "Hyväksytty",
        color: "green",
        datetime: "15.5.2020",
        comment: "Hallituksen kokous 11 / 2020",
    },
    {
        icon: CheckCircle,
        title: "Maksettu",
        color: "indigo",
        datetime: "15.5.2020",
        comment: "Tilille FI92 2563 2367 2367 65",
    },
];

export const withSteps = () => (
    <Box p={8}>
        <TimeLine
            steps={[
                steps[0],
                {
                    icon: Clock,
                    title: "Odottaa hyväksyntää",
                },
            ]}
        />
    </Box>
);

export const approved = () => (
    <Box p={8}>
        <TimeLine steps={[steps[0], steps[1]]} />
    </Box>
);

export const paid = () => (
    <Box p={8}>
        <TimeLine steps={steps} />
    </Box>
);

export const withActions = () => (
    <Box p={8}>
        <TimeLine
            steps={[
                steps[0],
                {
                    icon: ArrowRightCircle,
                    actions: (
                        <Box>
                            <Button variant="ghost" variantColor="green">
                                Hyväksy
                            </Button>
                            <Button ml={2} variant="ghost" variantColor="red">
                                Hylkää
                            </Button>
                        </Box>
                    ),
                },
            ]}
        />
    </Box>
);
