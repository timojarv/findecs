import React from 'react';

const Claims = props => {
    return (
        <main className="container grid-lg">
            <h2>Ostolaskut</h2>
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

            <table className="table" style={{ margin: '1.5em 0' }}>
                <thead>
                    <tr>
                        <th>Lähettäjä</th>
                        <th>Kuvaus</th>
                        <th>Eräpäivä</th>
                        <th>Summa</th>
                        <th>Huomautus</th>
                        <th>Toiminnot</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Firma XYZ</td>
                        <td>Kunhan testiksi</td>
                        <td>31.1.2020</td>
                        <td>123,50 €</td>
                        <td>Testiksi luotu</td>
                        <td>
                            <button
                                className="btn btn-sm btn-action mr-2 tooltip"
                                data-tooltip="Poista"
                            >
                                <i className="icon icon-delete"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-action tooltip"
                                data-tooltip="Muokkaa"
                            >
                                <i className="icon icon-edit"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>Firma XYZ</td>
                        <td>Kunhan testiksi</td>
                        <td>31.1.2020</td>
                        <td>123,50 €</td>
                        <td>Testiksi luotu</td>
                        <td>
                            <button
                                className="btn btn-sm btn-action mr-2 tooltip"
                                data-tooltip="Poista"
                            >
                                <i className="icon icon-delete"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-action tooltip"
                                data-tooltip="Muokkaa"
                            >
                                <i className="icon icon-edit"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>Firma XYZ</td>
                        <td>Kunhan testiksi</td>
                        <td>31.1.2020</td>
                        <td>123,50 €</td>
                        <td>Testiksi luotu</td>
                        <td>
                            <button
                                className="btn btn-sm btn-action mr-2 tooltip"
                                data-tooltip="Poista"
                            >
                                <i className="icon icon-delete"></i>
                            </button>
                            <button
                                className="btn btn-sm btn-action tooltip"
                                data-tooltip="Muokkaa"
                            >
                                <i className="icon icon-edit"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <p>
                <em>Sivu 1/1, näytetään 3 riviä yhteensä 3 rivistä.</em>
            </p>

            <button className="btn mr-2 disabled">
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
