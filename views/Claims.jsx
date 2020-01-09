import React from 'react';

const Claims = props => {
    return (
        <main className="container grid-lg">
            <h2>Kulukorvaukset</h2>
            <div className="divider"></div>
            <ul className="tab">
                <li className="tab-item active">
                    <a className="c-hand">Luotu</a>
                </li>
                <li className="tab-item">
                    <a className="c-hand">Hyväksytty</a>
                </li>
                <li className="tab-item">
                    <a className="c-hand">Maksettu</a>
                </li>
                <li className="tab-item">
                    <a className="c-hand">Hylätty</a>
                </li>
            </ul>

            <table className="table">
                <thead>
                    <tr>
                        <th>Luotu</th>
                        <th>Kuvaus</th>
                        <th>Summa</th>
                        <th>Rahan lähde</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>9.1.2020</td>
                        <td>Testaan vaan</td>
                        <td>200,50 €</td>
                        <td>Maksukortti</td>
                    </tr>
                    <tr>
                        <td>9.1.2020</td>
                        <td>Testaan vaan</td>
                        <td>200,50 €</td>
                        <td>Maksukortti</td>
                    </tr>
                    <tr>
                        <td>9.1.2020</td>
                        <td>Testaan vaan</td>
                        <td>200,50 €</td>
                        <td>Maksukortti</td>
                    </tr>
                    <tr>
                        <td>9.1.2020</td>
                        <td>Testaan vaan</td>
                        <td>200,50 €</td>
                        <td>Maksukortti</td>
                    </tr>
                </tbody>
            </table>

            <div className="mt-2 mb-2">
                <em>Sivu 1/1, näytetään 4 riviä yhteensä 4 rivistä.</em>
            </div>

            <button className="btn mr-2">
                <i className="icon icon-arrow-left"></i>
                Edellinen
            </button>
            <button className="btn">
                Seuraava
                <i className="icon icon-arrow-right"></i>
            </button>
        </main>
    );
};

export default Claims;
