Findecs-spesifikaatio
--------

Tähän dokumenttiin on kirjattu toiminnallisuus, joka Findecs-kulukorvausjärjestelmään on tarkoitus sisältyä. Dokumentti toimii samalla myös järjestelmän toteutussuunnitelmana.

# Kulukorvaukset

Kulukorvaukseen liittyvät seuraavat ominaisuudet:

- kuvaus
- juokseva numero
- tekijä
    - käyttäjän allekirjoitus
- hyväksyjä
    - käyttäjän allekirjoitus
- tila
- kustannuspaikka
- rahan lähde
- luotu
- muokattu
- summa
- kuitit

## Kuitti

Kulukorvaukseen liittyy yksi tai useampia kuitteja. Kuittiin liittyy seuraavat ominaisuudet:

- päiväys
- summa
- liitetiedosto

## Listaa

## Tarkastele

## Muokkaa

## Luo

## Poista


# Kustannuspaikat

Kulukorvaukset kohdistetaan kustannuspaikkoihin. Kustannuspaikkaan liittyvät seuraavat ominaisuudet:

- nimi
- budjetti

## Listaa

Listaa kaikki kustannuspaikat. Listassa näkyy myös, kuinka paljon kyseisen kustannuspaikan budjetista on jo käytetty ja kuinka paljon budjettia on jäljellä.

## Luo

Luo uusi kustannuspaikka antamalla seuraavat tiedot:

- nimi
- budjetti

## Muokkaa

Muokkaa kustannuspaikan nimeä tai budjettia.

Note: Nimeä on mahdollista muuttaa ainoastaan, kun kustannuspaikalle ei ole kohdistettu kuluja.

## Poista

Note: Koska kulukorvaukset kohdistetaan kustannuspaikkoihin, kustannuspaikkoja ei ole mahdollista poistaa mikäli niille on kohdistettu kuluja.

# Yhteystiedot

Yhteystiedot liittyvät osto- ja myyntilaskuihin. Niihin liittyvät seuraavat tiedot:

- nimi
- osoite

# Ostolaskut

## Listaa

## Tarkastele

## Muokkaa

## Luo

## Poista

# Myyntilaskut

## Listaa

## Tarkastele

## Muokkaa

## Luo

## Poista

# Asetukset

Käyttäjä pystyy muokkaamaan omista asetuksistaan seuraavia:

- nimi
- tilinumero
- puhelinnumero
- toimi / tehtävä
- allekirjoitus
- salasana

# Käyttäjät

Note: Vain ylläpitäjille.

Jokaiseen käyttäjään liittyvät seuraavat ominaisuudet:

- nimi
- sähköposti
- tilinumero
- puhelinnumero
- toimi / tehtävä
- allekirjoitus
- salasana
- rooli

## Listaa

Listaa kaikki järjestelmässä olevat käyttäjät.

## Tarkastele

Tarkastele yksittäisen käyttäjän tietoja.

## Muokkaa

Muokkaa käyttäjän tietoja:

- nimi
- sähköposti
- toimi / tehtävä
- rooli

## Luo

Luo käyttäjä. Vaatii seuraavat tiedot käyttäjästä:

- nimi
- sähköposti
- rooli
- toimi (ei pakollinen)
- salasana (ei pakollinen)

Jos salasanaa ei määritetä, käyttäjälle lähetetään "palauta salasanasi" -sähköposti.

## Poista

Poista käyttäjä (itseään ei voi poistaa)

# Autentikaatio

Käyttäjän avatessa järjestelmän pyydetään kirjautumistietoja (sähköposti ja salasana).

Mahdollisuus 'muistaa salasana'

## Unohtunut salasana

Jos käyttäjä on unohtanut salasanansa, hän voi pyytää sähköpostiinsa salasanan palautuslinkin.
Linkkiä klikkaamalla pääsee asettamaan uuden salasanan, minkä jälkeen käyttäjä ohjataan kirjautumissivulle,

# Käyttäjäroolit

Seuraavassa käydään läpi eri käyttäjäroolit. Jokaisella tasolla on listattu ne oikeudet, joita kyseisen tason käyttäjällä on alempien tasojen lisäksi.

## Peruskäyttäjä

Pystyy muokkaamaan omia tietojaan sekä luomaan korvauksia ja laskuja ja tarkastelemaan itse luomiaan edellämainittuja.

## Ylläpitäjä

Pystyy tarkastelemaan kaikkien käyttäjien luomia korvauksia ja laskuja sekä muokkaamaan, poistamaan ja hyväksymään niitä.

Pystyy viemään tietoja ulos järjestelmästä. (ks. seuraava luku)

## Pääkäyttäjä

Pystyy tarkastelemaan, muokkaamaan, luomaan ja poistamaan käyttäjiä.

Pystyy tuomaan järjestelmään tietoja. (ks. seuraava luku)

# Muu toiminnallisuus

## Tuo tietoja

Tietoja pitää pystyä tuomaan vanhasta järjestelmästä (esim. määrämuotoinen zip-tiedosto)

## Vie tietoja

Toiminnantarkastusta varten pitää pystyä viemään kaikki vuoden kulukorvaukset liitteineen pdf-tiedostoon.
