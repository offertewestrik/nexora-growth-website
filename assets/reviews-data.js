/* Echte klantreviews voor de verbouwpagina's.
 *
 * VUL DIT BESTAND, DAN VERSCHIJNT HET REVIEWBLOK VANZELF.
 * Staat de lijst leeg, dan tonen de pagina's geen reviewsectie en geven ze
 * ook geen beoordelingsgegevens aan Google door. Dat is bewust: een
 * verzonnen review is een misleidende handelspraktijk (art. 6:193 BW) en
 * Google verwijdert sterren die niet op echte, verifieerbare beoordelingen
 * berusten — met kans op een handmatige maatregel op het hele domein.
 *
 * Per review invullen:
 *   naam      Voornaam + achterletter, zoals de klant zelf akkoord gaf.
 *   plaats    Woonplaats (helpt bij de regiopagina's).
 *   datum     ISO-datum, bijvoorbeeld '2026-05-14'.
 *   score     Hele of halve ster tussen 1 en 5, zoals de klant hem gaf.
 *   tekst     De review letterlijk. Niet inkorten of mooier maken; wel
 *             mag u met toestemming typefouten herstellen.
 *   product   'uitbouw' | 'dakopbouw' | 'badkamer' — bepaalt op welke
 *             pagina's de review verschijnt.
 *   bron      Waar de review vandaan komt, bijv. 'Google' of 'per e-mail'.
 *             Alleen reviews die u kunt aantonen bij een controle.
 *
 * Voorbeeld (uitgecommentarieerd — vervang door echte reviews):
 *   { naam: 'Familie J.', plaats: 'Uden', datum: '2026-05-14', score: 5,
 *     tekst: '...', product: 'uitbouw', bron: 'Google' },
 */
window.NGReviewsData = [
];
