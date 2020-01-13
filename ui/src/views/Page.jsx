import React from 'react';

const Page = props => {
    const { title, children, actions } = props;
    return (
        <React.Fragment>
            <div className="action-group">
                <h2 style={{ flex: 1 }} className="text-bold">{title}</h2>
                {actions}
            </div>
            <div className="divider pb-2"></div>
            {children}
        </React.Fragment>
    );
};

export default Page;