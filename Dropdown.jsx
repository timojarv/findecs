import React from 'react';

const Dropdown = props => {
    return (
        <div className="dropdown mr-2">
            <span
                href="#"
                className="btn btn-link dropdown-toggle"
                tabIndex="0"
            >
                {props.title} <i className="icon icon-caret"></i>
            </span>
            <ul className="menu">{props.children}</ul>
        </div>
    );
};

export default Dropdown;
