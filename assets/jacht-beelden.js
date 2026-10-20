/* Beeldbank van de jachtconfigurator — GEGENEREERD BESTAND.
 *
 * Niet met de hand bijwerken: dit bestand komt uit
 * tools/jacht-renderlijst.js, dat de lijst afleidt uit jacht-data.js en
 * controleert welke bestanden er werkelijk staan.
 *
 * kies() zoekt de EXACTE combinatie en niets anders. Terugvallen op een
 * andere rompkleur of een ander dektype mag hier niet: een koper die
 * nachtblauw kiest en een parelwitte render ziet, denkt dat hij parelwit
 * krijgt. Ontbreekt de render, dan geeft kies() null terug en blijft de
 * getekende SVG staan — er is dus altijd beeld.
 *
 * Stand: 498 van 498 beelden aanwezig, plus 12 ruimte-impressies.
 */
(function (global) {
  'use strict';

  var MAP = './assets/media/';
  var BUITEN = [["elite90","flybridge","nachtblauw","wit","jacht/buiten/elite90-nachtblauw-wit.webp",1],["fb19","hardtop","nachtblauw","wit","jacht/buiten/fb19-hardtop-nachtblauw-wit.webp",1],["fb24","flybridge","nachtblauw","wit","jacht/buiten/fb24-flybridge-nachtblauw-wit.webp",1],["flagship70","flybridge","nachtblauw","wit","jacht/buiten/flagship70-nachtblauw-wit.webp",1],["giga120","flybridge","nachtblauw","wit","jacht/buiten/giga120-nachtblauw-wit.webp",1],["grand55","flybridge","nachtblauw","wit","jacht/buiten/grand55-nachtblauw-wit.webp",1],["sc16","open","nachtblauw","wit","jacht/buiten/sc16-open-nachtblauw-wit.webp",1],["sport40","flybridge","nachtblauw","wit","jacht/buiten/sport40-nachtblauw-wit.webp",1],["sy37","flybridge","nachtblauw","wit","jacht/buiten/sy37-flybridge-nachtblauw-wit.webp",1],["td29","flybridge","nachtblauw","wit","jacht/buiten/td29-flybridge-nachtblauw-wit.webp",1],["elite90","flybridge","antraciet","wit","jacht/buiten/elite90-antraciet-wit.webp",1],["elite90","flybridge","champagne","wit","jacht/buiten/elite90-champagne-wit.webp",1],["elite90","flybridge","grafiet","wit","jacht/buiten/elite90-grafiet-wit.webp",1],["elite90","flybridge","parelwit","wit","jacht/buiten/elite90-parelwit-wit.webp",1],["elite90","flybridge","zeegroen","wit","jacht/buiten/elite90-zeegroen-wit.webp",1],["fb19","flybridge","antraciet","wit","jacht/buiten/fb19-flybridge-antraciet-wit.webp",1],["fb19","flybridge","champagne","wit","jacht/buiten/fb19-flybridge-champagne-wit.webp",1],["fb19","flybridge","grafiet","wit","jacht/buiten/fb19-flybridge-grafiet-wit.webp",1],["fb19","flybridge","nachtblauw","wit","jacht/buiten/fb19-flybridge-nachtblauw-wit.webp",1],["fb19","flybridge","parelwit","wit","jacht/buiten/fb19-flybridge-parelwit-wit.webp",1],["fb19","flybridge","zeegroen","wit","jacht/buiten/fb19-flybridge-zeegroen-wit.webp",1],["fb19","hardtop","antraciet","wit","jacht/buiten/fb19-hardtop-antraciet-wit.webp",1],["fb19","hardtop","champagne","wit","jacht/buiten/fb19-hardtop-champagne-wit.webp",1],["fb19","hardtop","grafiet","wit","jacht/buiten/fb19-hardtop-grafiet-wit.webp",1],["fb19","hardtop","parelwit","wit","jacht/buiten/fb19-hardtop-parelwit-wit.webp",1],["fb19","hardtop","zeegroen","wit","jacht/buiten/fb19-hardtop-zeegroen-wit.webp",1],["fb24","flybridge","antraciet","wit","jacht/buiten/fb24-flybridge-antraciet-wit.webp",1],["fb24","flybridge","champagne","wit","jacht/buiten/fb24-flybridge-champagne-wit.webp",1],["fb24","flybridge","grafiet","wit","jacht/buiten/fb24-flybridge-grafiet-wit.webp",1],["fb24","flybridge","parelwit","wit","jacht/buiten/fb24-flybridge-parelwit-wit.webp",1],["fb24","flybridge-ttop","antraciet","wit","jacht/buiten/fb24-flybridge-ttop-antraciet-wit.webp",1],["fb24","flybridge-ttop","champagne","wit","jacht/buiten/fb24-flybridge-ttop-champagne-wit.webp",1],["fb24","flybridge-ttop","grafiet","wit","jacht/buiten/fb24-flybridge-ttop-grafiet-wit.webp",1],["fb24","flybridge-ttop","nachtblauw","wit","jacht/buiten/fb24-flybridge-ttop-nachtblauw-wit.webp",1],["fb24","flybridge-ttop","parelwit","wit","jacht/buiten/fb24-flybridge-ttop-parelwit-wit.webp",1],["fb24","flybridge-ttop","zeegroen","wit","jacht/buiten/fb24-flybridge-ttop-zeegroen-wit.webp",1],["fb24","flybridge","zeegroen","wit","jacht/buiten/fb24-flybridge-zeegroen-wit.webp",1],["flagship70","flybridge","antraciet","wit","jacht/buiten/flagship70-antraciet-wit.webp",1],["flagship70","flybridge","champagne","wit","jacht/buiten/flagship70-champagne-wit.webp",1],["flagship70","flybridge","grafiet","wit","jacht/buiten/flagship70-grafiet-wit.webp",1],["flagship70","flybridge","parelwit","wit","jacht/buiten/flagship70-parelwit-wit.webp",1],["flagship70","flybridge","zeegroen","wit","jacht/buiten/flagship70-zeegroen-wit.webp",1],["giga120","flybridge","antraciet","wit","jacht/buiten/giga120-antraciet-wit.webp",1],["giga120","flybridge","champagne","wit","jacht/buiten/giga120-champagne-wit.webp",1],["giga120","flybridge","grafiet","wit","jacht/buiten/giga120-grafiet-wit.webp",1],["giga120","flybridge","parelwit","wit","jacht/buiten/giga120-parelwit-wit.webp",1],["giga120","flybridge","zeegroen","wit","jacht/buiten/giga120-zeegroen-wit.webp",1],["grand55","flybridge","antraciet","wit","jacht/buiten/grand55-antraciet-wit.webp",1],["grand55","flybridge","champagne","wit","jacht/buiten/grand55-champagne-wit.webp",1],["grand55","flybridge","grafiet","wit","jacht/buiten/grand55-grafiet-wit.webp",1],["grand55","flybridge","parelwit","wit","jacht/buiten/grand55-parelwit-wit.webp",1],["grand55","flybridge","zeegroen","wit","jacht/buiten/grand55-zeegroen-wit.webp",1],["sc16","hardtop","antraciet","wit","jacht/buiten/sc16-hardtop-antraciet-wit.webp",1],["sc16","hardtop","champagne","wit","jacht/buiten/sc16-hardtop-champagne-wit.webp",1],["sc16","hardtop","grafiet","wit","jacht/buiten/sc16-hardtop-grafiet-wit.webp",1],["sc16","hardtop","nachtblauw","wit","jacht/buiten/sc16-hardtop-nachtblauw-wit.webp",1],["sc16","hardtop","parelwit","wit","jacht/buiten/sc16-hardtop-parelwit-wit.webp",1],["sc16","hardtop","zeegroen","wit","jacht/buiten/sc16-hardtop-zeegroen-wit.webp",1],["sc16","open","antraciet","wit","jacht/buiten/sc16-open-antraciet-wit.webp",1],["sc16","open","champagne","wit","jacht/buiten/sc16-open-champagne-wit.webp",1],["sc16","open","grafiet","wit","jacht/buiten/sc16-open-grafiet-wit.webp",1],["sc16","open","parelwit","wit","jacht/buiten/sc16-open-parelwit-wit.webp",1],["sc16","open","zeegroen","wit","jacht/buiten/sc16-open-zeegroen-wit.webp",1],["sport40","flybridge","antraciet","wit","jacht/buiten/sport40-antraciet-wit.webp",1],["sport40","flybridge","champagne","wit","jacht/buiten/sport40-champagne-wit.webp",1],["sport40","flybridge","grafiet","wit","jacht/buiten/sport40-grafiet-wit.webp",1],["sport40","flybridge","parelwit","wit","jacht/buiten/sport40-parelwit-wit.webp",1],["sport40","flybridge","zeegroen","wit","jacht/buiten/sport40-zeegroen-wit.webp",1],["sy37","flybridge","antraciet","wit","jacht/buiten/sy37-flybridge-antraciet-wit.webp",1],["sy37","flybridge","champagne","wit","jacht/buiten/sy37-flybridge-champagne-wit.webp",1],["sy37","flybridge","grafiet","wit","jacht/buiten/sy37-flybridge-grafiet-wit.webp",1],["sy37","flybridge","parelwit","wit","jacht/buiten/sy37-flybridge-parelwit-wit.webp",1],["sy37","flybridge-ttop","antraciet","wit","jacht/buiten/sy37-flybridge-ttop-antraciet-wit.webp",1],["sy37","flybridge-ttop","champagne","wit","jacht/buiten/sy37-flybridge-ttop-champagne-wit.webp",1],["sy37","flybridge-ttop","grafiet","wit","jacht/buiten/sy37-flybridge-ttop-grafiet-wit.webp",1],["sy37","flybridge-ttop","nachtblauw","wit","jacht/buiten/sy37-flybridge-ttop-nachtblauw-wit.webp",1],["sy37","flybridge-ttop","parelwit","wit","jacht/buiten/sy37-flybridge-ttop-parelwit-wit.webp",1],["sy37","flybridge-ttop","zeegroen","wit","jacht/buiten/sy37-flybridge-ttop-zeegroen-wit.webp",1],["sy37","flybridge","zeegroen","wit","jacht/buiten/sy37-flybridge-zeegroen-wit.webp",1],["td29","flybridge","antraciet","wit","jacht/buiten/td29-flybridge-antraciet-wit.webp",1],["td29","flybridge","champagne","wit","jacht/buiten/td29-flybridge-champagne-wit.webp",1],["td29","flybridge","grafiet","wit","jacht/buiten/td29-flybridge-grafiet-wit.webp",1],["td29","flybridge","parelwit","wit","jacht/buiten/td29-flybridge-parelwit-wit.webp",1],["td29","flybridge-ttop","antraciet","wit","jacht/buiten/td29-flybridge-ttop-antraciet-wit.webp",1],["td29","flybridge-ttop","champagne","wit","jacht/buiten/td29-flybridge-ttop-champagne-wit.webp",1],["td29","flybridge-ttop","grafiet","wit","jacht/buiten/td29-flybridge-ttop-grafiet-wit.webp",1],["td29","flybridge-ttop","nachtblauw","wit","jacht/buiten/td29-flybridge-ttop-nachtblauw-wit.webp",1],["td29","flybridge-ttop","parelwit","wit","jacht/buiten/td29-flybridge-ttop-parelwit-wit.webp",1],["td29","flybridge-ttop","zeegroen","wit","jacht/buiten/td29-flybridge-ttop-zeegroen-wit.webp",1],["td29","flybridge","zeegroen","wit","jacht/buiten/td29-flybridge-zeegroen-wit.webp",1],["elite90","flybridge","antraciet","romp","jacht/buiten/elite90-antraciet-romp.webp",1],["elite90","flybridge","antraciet","zand","jacht/buiten/elite90-antraciet-zand.webp",1],["elite90","flybridge","champagne","romp","jacht/buiten/elite90-champagne-romp.webp",1],["elite90","flybridge","champagne","zand","jacht/buiten/elite90-champagne-zand.webp",1],["elite90","flybridge","grafiet","romp","jacht/buiten/elite90-grafiet-romp.webp",1],["elite90","flybridge","grafiet","zand","jacht/buiten/elite90-grafiet-zand.webp",1],["elite90","flybridge","nachtblauw","romp","jacht/buiten/elite90-nachtblauw-romp.webp",1],["elite90","flybridge","nachtblauw","zand","jacht/buiten/elite90-nachtblauw-zand.webp",1],["elite90","flybridge","parelwit","romp","jacht/buiten/elite90-parelwit-romp.webp",1],["elite90","flybridge","parelwit","zand","jacht/buiten/elite90-parelwit-zand.webp",1],["elite90","flybridge","zeegroen","romp","jacht/buiten/elite90-zeegroen-romp.webp",1],["elite90","flybridge","zeegroen","zand","jacht/buiten/elite90-zeegroen-zand.webp",1],["fb19","flybridge","antraciet","romp","jacht/buiten/fb19-flybridge-antraciet-romp.webp",1],["fb19","flybridge","antraciet","zand","jacht/buiten/fb19-flybridge-antraciet-zand.webp",1],["fb19","flybridge","champagne","romp","jacht/buiten/fb19-flybridge-champagne-romp.webp",1],["fb19","flybridge","champagne","zand","jacht/buiten/fb19-flybridge-champagne-zand.webp",1],["fb19","flybridge","grafiet","romp","jacht/buiten/fb19-flybridge-grafiet-romp.webp",1],["fb19","flybridge","grafiet","zand","jacht/buiten/fb19-flybridge-grafiet-zand.webp",1],["fb19","flybridge","nachtblauw","romp","jacht/buiten/fb19-flybridge-nachtblauw-romp.webp",1],["fb19","flybridge","nachtblauw","zand","jacht/buiten/fb19-flybridge-nachtblauw-zand.webp",1],["fb19","flybridge","parelwit","romp","jacht/buiten/fb19-flybridge-parelwit-romp.webp",1],["fb19","flybridge","parelwit","zand","jacht/buiten/fb19-flybridge-parelwit-zand.webp",1],["fb19","flybridge","zeegroen","romp","jacht/buiten/fb19-flybridge-zeegroen-romp.webp",1],["fb19","flybridge","zeegroen","zand","jacht/buiten/fb19-flybridge-zeegroen-zand.webp",1],["fb19","hardtop","antraciet","romp","jacht/buiten/fb19-hardtop-antraciet-romp.webp",1],["fb19","hardtop","antraciet","zand","jacht/buiten/fb19-hardtop-antraciet-zand.webp",1],["fb19","hardtop","champagne","romp","jacht/buiten/fb19-hardtop-champagne-romp.webp",1],["fb19","hardtop","champagne","zand","jacht/buiten/fb19-hardtop-champagne-zand.webp",1],["fb19","hardtop","grafiet","romp","jacht/buiten/fb19-hardtop-grafiet-romp.webp",1],["fb19","hardtop","grafiet","zand","jacht/buiten/fb19-hardtop-grafiet-zand.webp",1],["fb19","hardtop","nachtblauw","romp","jacht/buiten/fb19-hardtop-nachtblauw-romp.webp",1],["fb19","hardtop","nachtblauw","zand","jacht/buiten/fb19-hardtop-nachtblauw-zand.webp",1],["fb19","hardtop","parelwit","romp","jacht/buiten/fb19-hardtop-parelwit-romp.webp",1],["fb19","hardtop","parelwit","zand","jacht/buiten/fb19-hardtop-parelwit-zand.webp",1],["fb19","hardtop","zeegroen","romp","jacht/buiten/fb19-hardtop-zeegroen-romp.webp",1],["fb19","hardtop","zeegroen","zand","jacht/buiten/fb19-hardtop-zeegroen-zand.webp",1],["fb24","flybridge","antraciet","romp","jacht/buiten/fb24-flybridge-antraciet-romp.webp",1],["fb24","flybridge","antraciet","zand","jacht/buiten/fb24-flybridge-antraciet-zand.webp",1],["fb24","flybridge","champagne","romp","jacht/buiten/fb24-flybridge-champagne-romp.webp",1],["fb24","flybridge","champagne","zand","jacht/buiten/fb24-flybridge-champagne-zand.webp",1],["fb24","flybridge","grafiet","romp","jacht/buiten/fb24-flybridge-grafiet-romp.webp",1],["fb24","flybridge","grafiet","zand","jacht/buiten/fb24-flybridge-grafiet-zand.webp",1],["fb24","flybridge","nachtblauw","romp","jacht/buiten/fb24-flybridge-nachtblauw-romp.webp",1],["fb24","flybridge","nachtblauw","zand","jacht/buiten/fb24-flybridge-nachtblauw-zand.webp",1],["fb24","flybridge","parelwit","romp","jacht/buiten/fb24-flybridge-parelwit-romp.webp",1],["fb24","flybridge","parelwit","zand","jacht/buiten/fb24-flybridge-parelwit-zand.webp",1],["fb24","flybridge-ttop","antraciet","romp","jacht/buiten/fb24-flybridge-ttop-antraciet-romp.webp",1],["fb24","flybridge-ttop","antraciet","zand","jacht/buiten/fb24-flybridge-ttop-antraciet-zand.webp",1],["fb24","flybridge-ttop","champagne","romp","jacht/buiten/fb24-flybridge-ttop-champagne-romp.webp",1],["fb24","flybridge-ttop","champagne","zand","jacht/buiten/fb24-flybridge-ttop-champagne-zand.webp",1],["fb24","flybridge-ttop","grafiet","romp","jacht/buiten/fb24-flybridge-ttop-grafiet-romp.webp",1],["fb24","flybridge-ttop","grafiet","zand","jacht/buiten/fb24-flybridge-ttop-grafiet-zand.webp",1],["fb24","flybridge-ttop","nachtblauw","romp","jacht/buiten/fb24-flybridge-ttop-nachtblauw-romp.webp",1],["fb24","flybridge-ttop","nachtblauw","zand","jacht/buiten/fb24-flybridge-ttop-nachtblauw-zand.webp",1],["fb24","flybridge-ttop","parelwit","romp","jacht/buiten/fb24-flybridge-ttop-parelwit-romp.webp",1],["fb24","flybridge-ttop","parelwit","zand","jacht/buiten/fb24-flybridge-ttop-parelwit-zand.webp",1],["fb24","flybridge-ttop","zeegroen","romp","jacht/buiten/fb24-flybridge-ttop-zeegroen-romp.webp",1],["fb24","flybridge-ttop","zeegroen","zand","jacht/buiten/fb24-flybridge-ttop-zeegroen-zand.webp",1],["fb24","flybridge","zeegroen","romp","jacht/buiten/fb24-flybridge-zeegroen-romp.webp",1],["fb24","flybridge","zeegroen","zand","jacht/buiten/fb24-flybridge-zeegroen-zand.webp",1],["flagship70","flybridge","antraciet","romp","jacht/buiten/flagship70-antraciet-romp.webp",1],["flagship70","flybridge","antraciet","zand","jacht/buiten/flagship70-antraciet-zand.webp",1],["flagship70","flybridge","champagne","romp","jacht/buiten/flagship70-champagne-romp.webp",1],["flagship70","flybridge","champagne","zand","jacht/buiten/flagship70-champagne-zand.webp",1],["flagship70","flybridge","grafiet","romp","jacht/buiten/flagship70-grafiet-romp.webp",1],["flagship70","flybridge","grafiet","zand","jacht/buiten/flagship70-grafiet-zand.webp",1],["flagship70","flybridge","nachtblauw","romp","jacht/buiten/flagship70-nachtblauw-romp.webp",1],["flagship70","flybridge","nachtblauw","zand","jacht/buiten/flagship70-nachtblauw-zand.webp",1],["flagship70","flybridge","parelwit","romp","jacht/buiten/flagship70-parelwit-romp.webp",1],["flagship70","flybridge","parelwit","zand","jacht/buiten/flagship70-parelwit-zand.webp",1],["flagship70","flybridge","zeegroen","romp","jacht/buiten/flagship70-zeegroen-romp.webp",1],["flagship70","flybridge","zeegroen","zand","jacht/buiten/flagship70-zeegroen-zand.webp",1],["giga120","flybridge","antraciet","romp","jacht/buiten/giga120-antraciet-romp.webp",1],["giga120","flybridge","antraciet","zand","jacht/buiten/giga120-antraciet-zand.webp",1],["giga120","flybridge","champagne","romp","jacht/buiten/giga120-champagne-romp.webp",1],["giga120","flybridge","champagne","zand","jacht/buiten/giga120-champagne-zand.webp",1],["giga120","flybridge","grafiet","romp","jacht/buiten/giga120-grafiet-romp.webp",1],["giga120","flybridge","grafiet","zand","jacht/buiten/giga120-grafiet-zand.webp",1],["giga120","flybridge","nachtblauw","romp","jacht/buiten/giga120-nachtblauw-romp.webp",1],["giga120","flybridge","nachtblauw","zand","jacht/buiten/giga120-nachtblauw-zand.webp",1],["giga120","flybridge","parelwit","romp","jacht/buiten/giga120-parelwit-romp.webp",1],["giga120","flybridge","parelwit","zand","jacht/buiten/giga120-parelwit-zand.webp",1],["giga120","flybridge","zeegroen","romp","jacht/buiten/giga120-zeegroen-romp.webp",1],["giga120","flybridge","zeegroen","zand","jacht/buiten/giga120-zeegroen-zand.webp",1],["grand55","flybridge","antraciet","romp","jacht/buiten/grand55-antraciet-romp.webp",1],["grand55","flybridge","antraciet","zand","jacht/buiten/grand55-antraciet-zand.webp",1],["grand55","flybridge","champagne","romp","jacht/buiten/grand55-champagne-romp.webp",1],["grand55","flybridge","champagne","zand","jacht/buiten/grand55-champagne-zand.webp",1],["grand55","flybridge","grafiet","romp","jacht/buiten/grand55-grafiet-romp.webp",1],["grand55","flybridge","grafiet","zand","jacht/buiten/grand55-grafiet-zand.webp",1],["grand55","flybridge","nachtblauw","romp","jacht/buiten/grand55-nachtblauw-romp.webp",1],["grand55","flybridge","nachtblauw","zand","jacht/buiten/grand55-nachtblauw-zand.webp",1],["grand55","flybridge","parelwit","romp","jacht/buiten/grand55-parelwit-romp.webp",1],["grand55","flybridge","parelwit","zand","jacht/buiten/grand55-parelwit-zand.webp",1],["grand55","flybridge","zeegroen","romp","jacht/buiten/grand55-zeegroen-romp.webp",1],["grand55","flybridge","zeegroen","zand","jacht/buiten/grand55-zeegroen-zand.webp",1],["sc16","hardtop","antraciet","romp","jacht/buiten/sc16-hardtop-antraciet-romp.webp",1],["sc16","hardtop","antraciet","zand","jacht/buiten/sc16-hardtop-antraciet-zand.webp",1],["sc16","hardtop","champagne","romp","jacht/buiten/sc16-hardtop-champagne-romp.webp",1],["sc16","hardtop","champagne","zand","jacht/buiten/sc16-hardtop-champagne-zand.webp",1],["sc16","hardtop","grafiet","romp","jacht/buiten/sc16-hardtop-grafiet-romp.webp",1],["sc16","hardtop","grafiet","zand","jacht/buiten/sc16-hardtop-grafiet-zand.webp",1],["sc16","hardtop","nachtblauw","romp","jacht/buiten/sc16-hardtop-nachtblauw-romp.webp",1],["sc16","hardtop","nachtblauw","zand","jacht/buiten/sc16-hardtop-nachtblauw-zand.webp",1],["sc16","hardtop","parelwit","romp","jacht/buiten/sc16-hardtop-parelwit-romp.webp",1],["sc16","hardtop","parelwit","zand","jacht/buiten/sc16-hardtop-parelwit-zand.webp",1],["sc16","hardtop","zeegroen","romp","jacht/buiten/sc16-hardtop-zeegroen-romp.webp",1],["sc16","hardtop","zeegroen","zand","jacht/buiten/sc16-hardtop-zeegroen-zand.webp",1],["sc16","open","antraciet","romp","jacht/buiten/sc16-open-antraciet-romp.webp",1],["sc16","open","antraciet","zand","jacht/buiten/sc16-open-antraciet-zand.webp",1],["sc16","open","champagne","romp","jacht/buiten/sc16-open-champagne-romp.webp",1],["sc16","open","champagne","zand","jacht/buiten/sc16-open-champagne-zand.webp",1],["sc16","open","grafiet","romp","jacht/buiten/sc16-open-grafiet-romp.webp",1],["sc16","open","grafiet","zand","jacht/buiten/sc16-open-grafiet-zand.webp",1],["sc16","open","nachtblauw","romp","jacht/buiten/sc16-open-nachtblauw-romp.webp",1],["sc16","open","nachtblauw","zand","jacht/buiten/sc16-open-nachtblauw-zand.webp",1],["sc16","open","parelwit","romp","jacht/buiten/sc16-open-parelwit-romp.webp",1],["sc16","open","parelwit","zand","jacht/buiten/sc16-open-parelwit-zand.webp",1],["sc16","open","zeegroen","romp","jacht/buiten/sc16-open-zeegroen-romp.webp",1],["sc16","open","zeegroen","zand","jacht/buiten/sc16-open-zeegroen-zand.webp",1],["sport40","flybridge","antraciet","romp","jacht/buiten/sport40-antraciet-romp.webp",1],["sport40","flybridge","antraciet","zand","jacht/buiten/sport40-antraciet-zand.webp",1],["sport40","flybridge","champagne","romp","jacht/buiten/sport40-champagne-romp.webp",1],["sport40","flybridge","champagne","zand","jacht/buiten/sport40-champagne-zand.webp",1],["sport40","flybridge","grafiet","romp","jacht/buiten/sport40-grafiet-romp.webp",1],["sport40","flybridge","grafiet","zand","jacht/buiten/sport40-grafiet-zand.webp",1],["sport40","flybridge","nachtblauw","romp","jacht/buiten/sport40-nachtblauw-romp.webp",1],["sport40","flybridge","nachtblauw","zand","jacht/buiten/sport40-nachtblauw-zand.webp",1],["sport40","flybridge","parelwit","romp","jacht/buiten/sport40-parelwit-romp.webp",1],["sport40","flybridge","parelwit","zand","jacht/buiten/sport40-parelwit-zand.webp",1],["sport40","flybridge","zeegroen","romp","jacht/buiten/sport40-zeegroen-romp.webp",1],["sport40","flybridge","zeegroen","zand","jacht/buiten/sport40-zeegroen-zand.webp",1],["sy37","flybridge","antraciet","romp","jacht/buiten/sy37-flybridge-antraciet-romp.webp",1],["sy37","flybridge","antraciet","zand","jacht/buiten/sy37-flybridge-antraciet-zand.webp",1],["sy37","flybridge","champagne","romp","jacht/buiten/sy37-flybridge-champagne-romp.webp",1],["sy37","flybridge","champagne","zand","jacht/buiten/sy37-flybridge-champagne-zand.webp",1],["sy37","flybridge","grafiet","romp","jacht/buiten/sy37-flybridge-grafiet-romp.webp",1],["sy37","flybridge","grafiet","zand","jacht/buiten/sy37-flybridge-grafiet-zand.webp",1],["sy37","flybridge","nachtblauw","romp","jacht/buiten/sy37-flybridge-nachtblauw-romp.webp",1],["sy37","flybridge","nachtblauw","zand","jacht/buiten/sy37-flybridge-nachtblauw-zand.webp",1],["sy37","flybridge","parelwit","romp","jacht/buiten/sy37-flybridge-parelwit-romp.webp",1],["sy37","flybridge","parelwit","zand","jacht/buiten/sy37-flybridge-parelwit-zand.webp",1],["sy37","flybridge-ttop","antraciet","romp","jacht/buiten/sy37-flybridge-ttop-antraciet-romp.webp",1],["sy37","flybridge-ttop","antraciet","zand","jacht/buiten/sy37-flybridge-ttop-antraciet-zand.webp",1],["sy37","flybridge-ttop","champagne","romp","jacht/buiten/sy37-flybridge-ttop-champagne-romp.webp",1],["sy37","flybridge-ttop","champagne","zand","jacht/buiten/sy37-flybridge-ttop-champagne-zand.webp",1],["sy37","flybridge-ttop","grafiet","romp","jacht/buiten/sy37-flybridge-ttop-grafiet-romp.webp",1],["sy37","flybridge-ttop","grafiet","zand","jacht/buiten/sy37-flybridge-ttop-grafiet-zand.webp",1],["sy37","flybridge-ttop","nachtblauw","romp","jacht/buiten/sy37-flybridge-ttop-nachtblauw-romp.webp",1],["sy37","flybridge-ttop","nachtblauw","zand","jacht/buiten/sy37-flybridge-ttop-nachtblauw-zand.webp",1],["sy37","flybridge-ttop","parelwit","romp","jacht/buiten/sy37-flybridge-ttop-parelwit-romp.webp",1],["sy37","flybridge-ttop","parelwit","zand","jacht/buiten/sy37-flybridge-ttop-parelwit-zand.webp",1],["sy37","flybridge-ttop","zeegroen","romp","jacht/buiten/sy37-flybridge-ttop-zeegroen-romp.webp",1],["sy37","flybridge-ttop","zeegroen","zand","jacht/buiten/sy37-flybridge-ttop-zeegroen-zand.webp",1],["sy37","flybridge","zeegroen","romp","jacht/buiten/sy37-flybridge-zeegroen-romp.webp",1],["sy37","flybridge","zeegroen","zand","jacht/buiten/sy37-flybridge-zeegroen-zand.webp",1],["td29","flybridge","antraciet","romp","jacht/buiten/td29-flybridge-antraciet-romp.webp",1],["td29","flybridge","antraciet","zand","jacht/buiten/td29-flybridge-antraciet-zand.webp",1],["td29","flybridge","champagne","romp","jacht/buiten/td29-flybridge-champagne-romp.webp",1],["td29","flybridge","champagne","zand","jacht/buiten/td29-flybridge-champagne-zand.webp",1],["td29","flybridge","grafiet","romp","jacht/buiten/td29-flybridge-grafiet-romp.webp",1],["td29","flybridge","grafiet","zand","jacht/buiten/td29-flybridge-grafiet-zand.webp",1],["td29","flybridge","nachtblauw","romp","jacht/buiten/td29-flybridge-nachtblauw-romp.webp",1],["td29","flybridge","nachtblauw","zand","jacht/buiten/td29-flybridge-nachtblauw-zand.webp",1],["td29","flybridge","parelwit","romp","jacht/buiten/td29-flybridge-parelwit-romp.webp",1],["td29","flybridge","parelwit","zand","jacht/buiten/td29-flybridge-parelwit-zand.webp",1],["td29","flybridge-ttop","antraciet","romp","jacht/buiten/td29-flybridge-ttop-antraciet-romp.webp",1],["td29","flybridge-ttop","antraciet","zand","jacht/buiten/td29-flybridge-ttop-antraciet-zand.webp",1],["td29","flybridge-ttop","champagne","romp","jacht/buiten/td29-flybridge-ttop-champagne-romp.webp",1],["td29","flybridge-ttop","champagne","zand","jacht/buiten/td29-flybridge-ttop-champagne-zand.webp",1],["td29","flybridge-ttop","grafiet","romp","jacht/buiten/td29-flybridge-ttop-grafiet-romp.webp",1],["td29","flybridge-ttop","grafiet","zand","jacht/buiten/td29-flybridge-ttop-grafiet-zand.webp",1],["td29","flybridge-ttop","nachtblauw","romp","jacht/buiten/td29-flybridge-ttop-nachtblauw-romp.webp",1],["td29","flybridge-ttop","nachtblauw","zand","jacht/buiten/td29-flybridge-ttop-nachtblauw-zand.webp",1],["td29","flybridge-ttop","parelwit","romp","jacht/buiten/td29-flybridge-ttop-parelwit-romp.webp",1],["td29","flybridge-ttop","parelwit","zand","jacht/buiten/td29-flybridge-ttop-parelwit-zand.webp",1],["td29","flybridge-ttop","zeegroen","romp","jacht/buiten/td29-flybridge-ttop-zeegroen-romp.webp",1],["td29","flybridge-ttop","zeegroen","zand","jacht/buiten/td29-flybridge-ttop-zeegroen-zand.webp",1],["td29","flybridge","zeegroen","romp","jacht/buiten/td29-flybridge-zeegroen-romp.webp",1],["td29","flybridge","zeegroen","zand","jacht/buiten/td29-flybridge-zeegroen-zand.webp",1]];
  var INTERIEUR = [["fb19","eiken","antraciet","jacht/interieur/fb19-eiken-antraciet.webp",1],["fb19","eiken","cognac","jacht/interieur/fb19-eiken-cognac.webp",1],["fb19","eiken","offwhite","jacht/interieur/fb19-eiken-offwhite.webp",1],["fb19","eiken","zand","jacht/interieur/fb19-eiken-zand.webp",1],["fb19","essen","antraciet","jacht/interieur/fb19-essen-antraciet.webp",1],["fb19","essen","cognac","jacht/interieur/fb19-essen-cognac.webp",1],["fb19","essen","offwhite","jacht/interieur/fb19-essen-offwhite.webp",1],["fb19","essen","zand","jacht/interieur/fb19-essen-zand.webp",1],["fb19","teakhout","antraciet","jacht/interieur/fb19-teakhout-antraciet.webp",1],["fb19","teakhout","cognac","jacht/interieur/fb19-teakhout-cognac.webp",1],["fb19","teakhout","offwhite","jacht/interieur/fb19-teakhout-offwhite.webp",1],["fb19","teakhout","zand","jacht/interieur/fb19-teakhout-zand.webp",1],["fb19","walnoot","antraciet","jacht/interieur/fb19-walnoot-antraciet.webp",1],["fb19","walnoot","cognac","jacht/interieur/fb19-walnoot-cognac.webp",1],["fb19","walnoot","offwhite","jacht/interieur/fb19-walnoot-offwhite.webp",1],["fb19","walnoot","zand","jacht/interieur/fb19-walnoot-zand.webp",1],["fb19","wenge","antraciet","jacht/interieur/fb19-wenge-antraciet.webp",1],["fb19","wenge","cognac","jacht/interieur/fb19-wenge-cognac.webp",1],["fb19","wenge","offwhite","jacht/interieur/fb19-wenge-offwhite.webp",1],["fb19","wenge","zand","jacht/interieur/fb19-wenge-zand.webp",1],["fb24","eiken","antraciet","jacht/interieur/fb24-eiken-antraciet.webp",1],["fb24","eiken","cognac","jacht/interieur/fb24-eiken-cognac.webp",1],["fb24","eiken","offwhite","jacht/interieur/fb24-eiken-offwhite.webp",1],["fb24","eiken","zand","jacht/interieur/fb24-eiken-zand.webp",1],["fb24","essen","antraciet","jacht/interieur/fb24-essen-antraciet.webp",1],["fb24","essen","cognac","jacht/interieur/fb24-essen-cognac.webp",1],["fb24","essen","offwhite","jacht/interieur/fb24-essen-offwhite.webp",1],["fb24","essen","zand","jacht/interieur/fb24-essen-zand.webp",1],["fb24","teakhout","antraciet","jacht/interieur/fb24-teakhout-antraciet.webp",1],["fb24","teakhout","cognac","jacht/interieur/fb24-teakhout-cognac.webp",1],["fb24","teakhout","offwhite","jacht/interieur/fb24-teakhout-offwhite.webp",1],["fb24","teakhout","zand","jacht/interieur/fb24-teakhout-zand.webp",1],["fb24","walnoot","antraciet","jacht/interieur/fb24-walnoot-antraciet.webp",1],["fb24","walnoot","cognac","jacht/interieur/fb24-walnoot-cognac.webp",1],["fb24","walnoot","offwhite","jacht/interieur/fb24-walnoot-offwhite.webp",1],["fb24","walnoot","zand","jacht/interieur/fb24-walnoot-zand.webp",1],["fb24","wenge","antraciet","jacht/interieur/fb24-wenge-antraciet.webp",1],["fb24","wenge","cognac","jacht/interieur/fb24-wenge-cognac.webp",1],["fb24","wenge","offwhite","jacht/interieur/fb24-wenge-offwhite.webp",1],["fb24","wenge","zand","jacht/interieur/fb24-wenge-zand.webp",1],["sc16","eiken","antraciet","jacht/interieur/sc16-eiken-antraciet.webp",1],["sc16","eiken","cognac","jacht/interieur/sc16-eiken-cognac.webp",1],["sc16","eiken","offwhite","jacht/interieur/sc16-eiken-offwhite.webp",1],["sc16","eiken","zand","jacht/interieur/sc16-eiken-zand.webp",1],["sc16","essen","antraciet","jacht/interieur/sc16-essen-antraciet.webp",1],["sc16","essen","cognac","jacht/interieur/sc16-essen-cognac.webp",1],["sc16","essen","offwhite","jacht/interieur/sc16-essen-offwhite.webp",1],["sc16","essen","zand","jacht/interieur/sc16-essen-zand.webp",1],["sc16","teakhout","antraciet","jacht/interieur/sc16-teakhout-antraciet.webp",1],["sc16","teakhout","cognac","jacht/interieur/sc16-teakhout-cognac.webp",1],["sc16","teakhout","offwhite","jacht/interieur/sc16-teakhout-offwhite.webp",1],["sc16","teakhout","zand","jacht/interieur/sc16-teakhout-zand.webp",1],["sc16","walnoot","antraciet","jacht/interieur/sc16-walnoot-antraciet.webp",1],["sc16","walnoot","cognac","jacht/interieur/sc16-walnoot-cognac.webp",1],["sc16","walnoot","offwhite","jacht/interieur/sc16-walnoot-offwhite.webp",1],["sc16","walnoot","zand","jacht/interieur/sc16-walnoot-zand.webp",1],["sc16","wenge","antraciet","jacht/interieur/sc16-wenge-antraciet.webp",1],["sc16","wenge","cognac","jacht/interieur/sc16-wenge-cognac.webp",1],["sc16","wenge","offwhite","jacht/interieur/sc16-wenge-offwhite.webp",1],["sc16","wenge","zand","jacht/interieur/sc16-wenge-zand.webp",1],["sy37","eiken","antraciet","jacht/interieur/sy37-eiken-antraciet.webp",1],["sy37","eiken","cognac","jacht/interieur/sy37-eiken-cognac.webp",1],["sy37","eiken","offwhite","jacht/interieur/sy37-eiken-offwhite.webp",1],["sy37","eiken","zand","jacht/interieur/sy37-eiken-zand.webp",1],["sy37","essen","antraciet","jacht/interieur/sy37-essen-antraciet.webp",1],["sy37","essen","cognac","jacht/interieur/sy37-essen-cognac.webp",1],["sy37","essen","offwhite","jacht/interieur/sy37-essen-offwhite.webp",1],["sy37","essen","zand","jacht/interieur/sy37-essen-zand.webp",1],["sy37","teakhout","antraciet","jacht/interieur/sy37-teakhout-antraciet.webp",1],["sy37","teakhout","cognac","jacht/interieur/sy37-teakhout-cognac.webp",1],["sy37","teakhout","offwhite","jacht/interieur/sy37-teakhout-offwhite.webp",1],["sy37","teakhout","zand","jacht/interieur/sy37-teakhout-zand.webp",1],["sy37","walnoot","antraciet","jacht/interieur/sy37-walnoot-antraciet.webp",1],["sy37","walnoot","cognac","jacht/interieur/sy37-walnoot-cognac.webp",1],["sy37","walnoot","offwhite","jacht/interieur/sy37-walnoot-offwhite.webp",1],["sy37","walnoot","zand","jacht/interieur/sy37-walnoot-zand.webp",1],["sy37","wenge","antraciet","jacht/interieur/sy37-wenge-antraciet.webp",1],["sy37","wenge","cognac","jacht/interieur/sy37-wenge-cognac.webp",1],["sy37","wenge","offwhite","jacht/interieur/sy37-wenge-offwhite.webp",1],["sy37","wenge","zand","jacht/interieur/sy37-wenge-zand.webp",1],["td29","eiken","antraciet","jacht/interieur/td29-eiken-antraciet.webp",1],["td29","eiken","cognac","jacht/interieur/td29-eiken-cognac.webp",1],["td29","eiken","offwhite","jacht/interieur/td29-eiken-offwhite.webp",1],["td29","eiken","zand","jacht/interieur/td29-eiken-zand.webp",1],["td29","essen","antraciet","jacht/interieur/td29-essen-antraciet.webp",1],["td29","essen","cognac","jacht/interieur/td29-essen-cognac.webp",1],["td29","essen","offwhite","jacht/interieur/td29-essen-offwhite.webp",1],["td29","essen","zand","jacht/interieur/td29-essen-zand.webp",1],["td29","teakhout","antraciet","jacht/interieur/td29-teakhout-antraciet.webp",1],["td29","teakhout","cognac","jacht/interieur/td29-teakhout-cognac.webp",1],["td29","teakhout","offwhite","jacht/interieur/td29-teakhout-offwhite.webp",1],["td29","teakhout","zand","jacht/interieur/td29-teakhout-zand.webp",1],["td29","walnoot","antraciet","jacht/interieur/td29-walnoot-antraciet.webp",1],["td29","walnoot","cognac","jacht/interieur/td29-walnoot-cognac.webp",1],["td29","walnoot","offwhite","jacht/interieur/td29-walnoot-offwhite.webp",1],["td29","walnoot","zand","jacht/interieur/td29-walnoot-zand.webp",1],["td29","wenge","antraciet","jacht/interieur/td29-wenge-antraciet.webp",1],["td29","wenge","cognac","jacht/interieur/td29-wenge-cognac.webp",1],["td29","wenge","offwhite","jacht/interieur/td29-wenge-offwhite.webp",1],["td29","wenge","zand","jacht/interieur/td29-wenge-zand.webp",1],["sport40","walnoot","zand","jacht/interieur/sport40-walnoot-zand.webp",1],["sport40","walnoot","antraciet","jacht/interieur/sport40-walnoot-antraciet.webp",1],["sport40","walnoot","offwhite","jacht/interieur/sport40-walnoot-offwhite.webp",1],["sport40","walnoot","cognac","jacht/interieur/sport40-walnoot-cognac.webp",1],["sport40","eiken","zand","jacht/interieur/sport40-eiken-zand.webp",1],["sport40","eiken","antraciet","jacht/interieur/sport40-eiken-antraciet.webp",1],["sport40","eiken","offwhite","jacht/interieur/sport40-eiken-offwhite.webp",1],["sport40","eiken","cognac","jacht/interieur/sport40-eiken-cognac.webp",1],["sport40","teakhout","zand","jacht/interieur/sport40-teakhout-zand.webp",1],["sport40","teakhout","antraciet","jacht/interieur/sport40-teakhout-antraciet.webp",1],["sport40","teakhout","offwhite","jacht/interieur/sport40-teakhout-offwhite.webp",1],["sport40","teakhout","cognac","jacht/interieur/sport40-teakhout-cognac.webp",1],["sport40","wenge","zand","jacht/interieur/sport40-wenge-zand.webp",1],["sport40","wenge","antraciet","jacht/interieur/sport40-wenge-antraciet.webp",1],["sport40","wenge","offwhite","jacht/interieur/sport40-wenge-offwhite.webp",1],["sport40","wenge","cognac","jacht/interieur/sport40-wenge-cognac.webp",1],["sport40","essen","zand","jacht/interieur/sport40-essen-zand.webp",1],["sport40","essen","antraciet","jacht/interieur/sport40-essen-antraciet.webp",1],["sport40","essen","offwhite","jacht/interieur/sport40-essen-offwhite.webp",1],["sport40","essen","cognac","jacht/interieur/sport40-essen-cognac.webp",1],["grand55","walnoot","zand","jacht/interieur/grand55-walnoot-zand.webp",1],["grand55","walnoot","antraciet","jacht/interieur/grand55-walnoot-antraciet.webp",1],["grand55","walnoot","offwhite","jacht/interieur/grand55-walnoot-offwhite.webp",1],["grand55","walnoot","cognac","jacht/interieur/grand55-walnoot-cognac.webp",1],["grand55","eiken","zand","jacht/interieur/grand55-eiken-zand.webp",1],["grand55","eiken","antraciet","jacht/interieur/grand55-eiken-antraciet.webp",1],["grand55","eiken","offwhite","jacht/interieur/grand55-eiken-offwhite.webp",1],["grand55","eiken","cognac","jacht/interieur/grand55-eiken-cognac.webp",1],["grand55","teakhout","zand","jacht/interieur/grand55-teakhout-zand.webp",1],["grand55","teakhout","antraciet","jacht/interieur/grand55-teakhout-antraciet.webp",1],["grand55","teakhout","offwhite","jacht/interieur/grand55-teakhout-offwhite.webp",1],["grand55","teakhout","cognac","jacht/interieur/grand55-teakhout-cognac.webp",1],["grand55","wenge","zand","jacht/interieur/grand55-wenge-zand.webp",1],["grand55","wenge","antraciet","jacht/interieur/grand55-wenge-antraciet.webp",1],["grand55","wenge","offwhite","jacht/interieur/grand55-wenge-offwhite.webp",1],["grand55","wenge","cognac","jacht/interieur/grand55-wenge-cognac.webp",1],["grand55","essen","zand","jacht/interieur/grand55-essen-zand.webp",1],["grand55","essen","antraciet","jacht/interieur/grand55-essen-antraciet.webp",1],["grand55","essen","offwhite","jacht/interieur/grand55-essen-offwhite.webp",1],["grand55","essen","cognac","jacht/interieur/grand55-essen-cognac.webp",1],["flagship70","walnoot","zand","jacht/interieur/flagship70-walnoot-zand.webp",1],["flagship70","walnoot","antraciet","jacht/interieur/flagship70-walnoot-antraciet.webp",1],["flagship70","walnoot","offwhite","jacht/interieur/flagship70-walnoot-offwhite.webp",1],["flagship70","walnoot","cognac","jacht/interieur/flagship70-walnoot-cognac.webp",1],["flagship70","eiken","zand","jacht/interieur/flagship70-eiken-zand.webp",1],["flagship70","eiken","antraciet","jacht/interieur/flagship70-eiken-antraciet.webp",1],["flagship70","eiken","offwhite","jacht/interieur/flagship70-eiken-offwhite.webp",1],["flagship70","eiken","cognac","jacht/interieur/flagship70-eiken-cognac.webp",1],["flagship70","teakhout","zand","jacht/interieur/flagship70-teakhout-zand.webp",1],["flagship70","teakhout","antraciet","jacht/interieur/flagship70-teakhout-antraciet.webp",1],["flagship70","teakhout","offwhite","jacht/interieur/flagship70-teakhout-offwhite.webp",1],["flagship70","teakhout","cognac","jacht/interieur/flagship70-teakhout-cognac.webp",1],["flagship70","wenge","zand","jacht/interieur/flagship70-wenge-zand.webp",1],["flagship70","wenge","antraciet","jacht/interieur/flagship70-wenge-antraciet.webp",1],["flagship70","wenge","offwhite","jacht/interieur/flagship70-wenge-offwhite.webp",1],["flagship70","wenge","cognac","jacht/interieur/flagship70-wenge-cognac.webp",1],["flagship70","essen","zand","jacht/interieur/flagship70-essen-zand.webp",1],["flagship70","essen","antraciet","jacht/interieur/flagship70-essen-antraciet.webp",1],["flagship70","essen","offwhite","jacht/interieur/flagship70-essen-offwhite.webp",1],["flagship70","essen","cognac","jacht/interieur/flagship70-essen-cognac.webp",1],["elite90","walnoot","zand","jacht/interieur/elite90-walnoot-zand.webp",1],["elite90","walnoot","antraciet","jacht/interieur/elite90-walnoot-antraciet.webp",1],["elite90","walnoot","offwhite","jacht/interieur/elite90-walnoot-offwhite.webp",1],["elite90","walnoot","cognac","jacht/interieur/elite90-walnoot-cognac.webp",1],["elite90","eiken","zand","jacht/interieur/elite90-eiken-zand.webp",1],["elite90","eiken","antraciet","jacht/interieur/elite90-eiken-antraciet.webp",1],["elite90","eiken","offwhite","jacht/interieur/elite90-eiken-offwhite.webp",1],["elite90","eiken","cognac","jacht/interieur/elite90-eiken-cognac.webp",1],["elite90","teakhout","zand","jacht/interieur/elite90-teakhout-zand.webp",1],["elite90","teakhout","antraciet","jacht/interieur/elite90-teakhout-antraciet.webp",1],["elite90","teakhout","offwhite","jacht/interieur/elite90-teakhout-offwhite.webp",1],["elite90","teakhout","cognac","jacht/interieur/elite90-teakhout-cognac.webp",1],["elite90","wenge","zand","jacht/interieur/elite90-wenge-zand.webp",1],["elite90","wenge","antraciet","jacht/interieur/elite90-wenge-antraciet.webp",1],["elite90","wenge","offwhite","jacht/interieur/elite90-wenge-offwhite.webp",1],["elite90","wenge","cognac","jacht/interieur/elite90-wenge-cognac.webp",1],["elite90","essen","zand","jacht/interieur/elite90-essen-zand.webp",1],["elite90","essen","antraciet","jacht/interieur/elite90-essen-antraciet.webp",1],["elite90","essen","offwhite","jacht/interieur/elite90-essen-offwhite.webp",1],["elite90","essen","cognac","jacht/interieur/elite90-essen-cognac.webp",1],["giga120","walnoot","zand","jacht/interieur/giga120-walnoot-zand.webp",1],["giga120","walnoot","antraciet","jacht/interieur/giga120-walnoot-antraciet.webp",1],["giga120","walnoot","offwhite","jacht/interieur/giga120-walnoot-offwhite.webp",1],["giga120","walnoot","cognac","jacht/interieur/giga120-walnoot-cognac.webp",1],["giga120","eiken","zand","jacht/interieur/giga120-eiken-zand.webp",1],["giga120","eiken","antraciet","jacht/interieur/giga120-eiken-antraciet.webp",1],["giga120","eiken","offwhite","jacht/interieur/giga120-eiken-offwhite.webp",1],["giga120","eiken","cognac","jacht/interieur/giga120-eiken-cognac.webp",1],["giga120","teakhout","zand","jacht/interieur/giga120-teakhout-zand.webp",1],["giga120","teakhout","antraciet","jacht/interieur/giga120-teakhout-antraciet.webp",1],["giga120","teakhout","offwhite","jacht/interieur/giga120-teakhout-offwhite.webp",1],["giga120","teakhout","cognac","jacht/interieur/giga120-teakhout-cognac.webp",1],["giga120","wenge","zand","jacht/interieur/giga120-wenge-zand.webp",1],["giga120","wenge","antraciet","jacht/interieur/giga120-wenge-antraciet.webp",1],["giga120","wenge","offwhite","jacht/interieur/giga120-wenge-offwhite.webp",1],["giga120","wenge","cognac","jacht/interieur/giga120-wenge-cognac.webp",1],["giga120","essen","zand","jacht/interieur/giga120-essen-zand.webp",1],["giga120","essen","antraciet","jacht/interieur/giga120-essen-antraciet.webp",1],["giga120","essen","offwhite","jacht/interieur/giga120-essen-offwhite.webp",1],["giga120","essen","cognac","jacht/interieur/giga120-essen-cognac.webp",1]];
  var LOS = [["dek","antislip","","jacht/dek/antislip.webp",1],["dek","composiet","","jacht/dek/composiet.webp",1],["dek","teak","","jacht/dek/teak.webp",1],["hero","elite90","","jacht/hero/elite90.webp",1],["hero","fb19","","jacht/hero/fb19.webp",1],["hero","fb24","","jacht/hero/fb24.webp",1],["hero","flagship70","","jacht/hero/flagship70.webp",1],["hero","giga120","","jacht/hero/giga120.webp",1],["hero","grand55","","jacht/hero/grand55.webp",1],["hero","sc16","","jacht/hero/sc16.webp",1],["hero","sport40","","jacht/hero/sport40.webp",1],["hero","sy37","","jacht/hero/sy37.webp",1],["hero","td29","","jacht/hero/td29.webp",1],["optie","airco","","jacht/opties/airco.webp",1],["optie","boegschroef","","jacht/opties/boegschroef.webp",1],["optie","jacuzzi","","jacht/opties/jacuzzi.webp",1],["optie","onderwaterlicht","","jacht/opties/onderwaterlicht.webp",1],["optie","satelliet","","jacht/opties/satelliet.webp",1],["optie","stabilisatoren","","jacht/opties/stabilisatoren.webp",1],["optie","tenderkraan","","jacht/opties/tenderkraan.webp",1],["optie","zonnepanelen","","jacht/opties/zonnepanelen.webp",1],["optie","watermaker","","jacht/opties/watermaker.webp",1],["optie","zwembad","","jacht/opties/zwembad.webp",1],["optie","zwemplateau","","jacht/opties/zwemplateau.webp",1],["startpunt","familie","","jacht/start/familie.webp",1],["startpunt","middellandse","","jacht/start/middellandse.webp",1],["startpunt","oceaan","","jacht/start/oceaan.webp",1],["startpunt","weekend","","jacht/start/weekend.webp",1]];

  function buitenBeeld(k) {
    for (var i = 0; i < BUITEN.length; i++) {
      var e = BUITEN[i];
      if (e[0] === k.model && e[1] === k.dek && e[2] === k.rompkleur && e[3] === k.opbouw) {
        return e[5] ? MAP + e[4] : null;
      }
    }
    return null;
  }

  /* het interieur is modelspecifiek: de salon van het ene model is de salon
     van het andere niet, dus ook hier exact of niets */
  function interieurBeeld(k) {
    for (var i = 0; i < INTERIEUR.length; i++) {
      var e = INTERIEUR[i];
      if (e[0] === k.model && e[1] === k.interieurhout && e[2] === k.stoffering) {
        return e[4] ? MAP + e[3] : null;
      }
    }
    return null;
  }

  function losBeeld(groep, sleutel, tweede) {
    if (groep === 'materiaal') {
      return MATERIAAL_BEELDEN.indexOf(sleutel) > -1
        ? MAP + 'jacht/materiaal/' + sleutel + '.webp' : null;
    }
    for (var i = 0; i < LOS.length; i++) {
      var e = LOS[i];
      if (e[0] === groep && e[1] === sleutel && (!tweede || e[2] === tweede)) {
        return e[4] ? MAP + e[3] : null;
      }
    }
    return null;
  }

  /* De salon met vier keuzes tegelijk: hout, stoffering, vloer en
     wandafwerking. Bestaat deze combinatie niet, dan null - en dan toont het
     blad de stalen, zoals het dat altijd deed. Nooit een andere combinatie
     tonen: dat is dezelfde regel als bij de rompkleur, en om dezelfde reden.
     Een koper die op wengé klikt en walnoot te zien krijgt, koopt walnoot en
     krijgt wengé. */
  function salonBeeld(k) {
    if (!k) return null;
    var sleutel = [k.interieurhout, k.stoffering, k.vloer, k.wandafwerking].join('-');
    return SALON_BEELDEN.indexOf(sleutel) > -1 ? MAP + 'jacht/salon/' + sleutel + '.webp' : null;
  }
  /* De badkamer volgt marmer en metaal. Deze zestien zijn compleet: vier maal
     vier is klein genoeg om af te maken, dus hier valt nooit iets terug. */
  function badBeeld(k) {
    if (!k) return null;
    var sleutel = k.marmer + '-' + k.metaal;
    return BAD_BEELDEN.indexOf(sleutel) > -1 ? MAP + 'jacht/bad/' + sleutel + '.webp' : null;
  }
  /* De lichtstand: dezelfde salon, vier keer anders verlicht. Ook compleet. */
  function lichtBeeld(k) {
    if (!k || !k.verlichting) return null;
    return LICHT_BEELDEN.indexOf(k.verlichting) > -1
      ? MAP + 'jacht/licht/' + k.verlichting + '.webp' : null;
  }

  function dekking() {
    var n = 0;
    for (var i = 0; i < BUITEN.length; i++) if (BUITEN[i][5]) n++;
    for (var h = 0; h < INTERIEUR.length; h++) if (INTERIEUR[h][4]) n++;
    for (var j = 0; j < LOS.length; j++) if (LOS[j][4]) n++;
    return { aanwezig: n, totaal: BUITEN.length + INTERIEUR.length + LOS.length };
  }

  /* Boven-, voor- en achteraanzicht volgen de rompkleur niet. Van bovenaf zie
     je vooral de dekindeling — sloepgarage, zonnedekken, zitkuilen, zwembad —
     en recht van voren de boegvorm, de breedte en het aantal dekken. Geen van
     drieën verandert mee met de lak, dus daar is één render per model genoeg,
     met een noot in de configurator die zegt dat het de catalogusuitvoering is.

     De DEKVORM volgen ze wél zodra daar een eigen render voor is; zie PER_DEK
     hieronder. Zolang die er niet is toont het beeld de dekvorm uit STANDAARD
     en zegt de configurator erbij dat dat niet de gekozen vorm is. */
  var VLAKKEN = ['sc16', 'fb19', 'fb24', 'td29', 'sy37',
                 'sport40', 'grand55', 'flagship70', 'elite90', 'giga120'];

  /* Van bovenaf is het dek het grootste vlak, dus daar is de dekafwerking wél
     te zien — en dus bestaat het bovenaanzicht in alle drie de afwerkingen.
     Voor- en achteraanzicht kennen die keuze niet: daar kijkt u tegen de romp
     aan en is van het dek nauwelijks iets zichtbaar. */
  var DEKAFWERKINGEN = ['teak', 'composiet', 'antislip'];

  /* WELKE DEKVORM STAAT ER OP HET BOVEN-, VOOR- EN ACHTERAANZICHT?

     Van die drie aanzichten bestond lang één render per model, en die toont
     onvermijdelijk één dekvorm. Bij vijf modellen valt er een dekvorm te
     kiezen, en dan kan het beeld iets anders tonen dan de bezoeker heeft
     aangevinkt. Bij twee modellen gebeurt dat al zonder dat er iets gekozen is,
     want de standaardkeuze is het eerste dek uit de lijst:

       sc16   standaard 'open cockpit'  -  de render toont een hardtop
       fb19   standaard 'hardtop'       -  de render toont een flybridge

     Dat is nagekeken op de beelden zelf en niet afgeleid uit de naamgeving.

     STANDAARD staat hier welke dekvorm het model-brede beeld toont: een
     dekvorm voor alle drie de aanzichten, of - waar de renders uiteenlopen -
     een dekvorm per aanzicht.
     PER_DEK houdt bij voor welke combinaties er wél een eigen render is; die
     lijst wordt bijgewerkt door tools/jacht-aanzichten-scan.py, dat de
     beeldmappen uitleest. Een browser kan niet opvragen of een bestand bestaat,
     dus zonder zo'n lijst zou elke poging tot een eigen render een gebroken
     beeld opleveren zodra hij er nog niet is.

     Staat een model in geen van beide, dan valt er niets te kiezen en kan er
     dus ook niets afwijken. */
  /* Per aanzicht, niet per model. Bij de Sport Coupe 16 lopen de drie renders
     namelijk uiteen: boven- en vooraanzicht tonen de open cockpit, het
     achteraanzicht een hardtop. Met een dekvorm per model stond de helft van
     de noten eronder verkeerd - hij waarschuwde voor een afwijking waar er
     geen was, en zweeg waar er wel een was. */
  var STANDAARD = {
    sc16: { boven: 'open', voor: 'open', achter: 'hardtop' },
    fb19: 'flybridge',
    fb24: 'flybridge',
    td29: 'flybridge',
    sy37: 'flybridge'
  };

  /* Bijgewerkt door tools/jacht-aanzichten-scan.py - niet met de hand wijzigen.
     Formaat: 'model|dek|aanzicht'. */
  var PER_DEK = [
    'fb19|hardtop|achter',
    'fb19|hardtop|boven',
    'fb19|hardtop|voor',
    'fb24|flybridge-ttop|achter',
    'fb24|flybridge-ttop|boven',
    'fb24|flybridge-ttop|voor',
    'sc16|hardtop|boven',
    'sc16|hardtop|voor',
    'sc16|open|achter',
    'sy37|flybridge-ttop|achter',
    'sy37|flybridge-ttop|boven',
    'sy37|flybridge-ttop|voor',
    'td29|flybridge-ttop|achter',
    'td29|flybridge-ttop|boven',
    'td29|flybridge-ttop|voor'
  ];

  function heeftEigen(model, dek, aanzicht) {
    return PER_DEK.indexOf(model + '|' + dek + '|' + aanzicht) > -1;
  }

  /* Welke dekvorm de bezoeker op dit aanzicht werkelijk te zien krijgt. Is er
     een eigen render voor zijn keuze, dan is dat zijn eigen keuze en valt er
     niets te waarschuwen. */
  function aanzichtDek(model, dek, aanzicht) {
    if (dek && aanzicht && heeftEigen(model, dek, aanzicht)) return dek;
    var st = STANDAARD[model];
    if (!st) return null;
    return typeof st === 'string' ? st : (st[aanzicht] || null);
  }

  function bovenBeeld(model, dekafwerking, dek) {
    if (VLAKKEN.indexOf(model) < 0) return null;
    var a = DEKAFWERKINGEN.indexOf(dekafwerking) > -1 ? dekafwerking : 'teak';
    var kern = heeftEigen(model, dek, 'boven') ? model + '-' + dek : model;
    return MAP + 'jacht/boven/' + kern + '-' + a + '.webp';
  }

  function voorBeeld(model, dek) {
    if (VLAKKEN.indexOf(model) < 0) return null;
    return MAP + 'jacht/voor/' + (heeftEigen(model, dek, 'voor') ? model + '-' + dek : model) + '.webp';
  }

  function achterBeeld(model, dek) {
    if (VLAKKEN.indexOf(model) < 0) return null;
    return MAP + 'jacht/achter/' + (heeftEigen(model, dek, 'achter') ? model + '-' + dek : model) + '.webp';
  }

  /* Elke optie heeft een eigen render: de jacuzzi op het zonnedek, de
     tenderkraan die een tender optilt, het onderwaterlicht in het donker. Die
     beelden stonden al in de bank maar werden alleen als miniatuur op de
     keuzeknop gebruikt. Wie de jacuzzi aanvinkte sprong naar het bovenaanzicht
     en zag daar niets veranderen — de optie zat immers niet in die render.
     Vandaar dat het optiebeeld nu zelf in het doek komt. */
  var OPTIES = ['airco', 'boegschroef', 'jacuzzi', 'onderwaterlicht', 'satelliet',
                'stabilisatoren', 'tenderkraan', 'watermaker', 'zonnepanelen',
                'zwembad', 'zwemplateau'];

  function optieBeeld(optie, model) {
    if (OPTIES.indexOf(optie) < 0) return null;
    var k = KLASSE[model];
    if (k && OPTIE_KLASSEN.indexOf(optie + '|' + k) > -1) {
      return MAP + 'jacht/opties/' + optie + '-' + k + '.webp';
    }
    return MAP + 'jacht/opties/' + optie + '.webp';
  }

  /* Toont dit optiebeeld het formaat van dít schip? De modelloze versie is de
     kleinste klasse - net als bij de ruimtes.

     Dat was een tijdlang niet waar. De elf modelloze beelden stonden alle elf
     op hetzelfde schip van een meter of veertig, met drie dekken, zijbalkons
     en een beach club, terwijl de Sport Coupe 16 zestien meter is en een dek
     heeft. En zes van de klassebeelden waren bij natoets niet van het
     modelloze te onderscheiden - stabilisatoren-groot was er pixel voor pixel
     gelijk aan. Alle achttien zijn opnieuw gerenderd en beeld voor beeld
     nagekeken; wat hier staat klopt weer. De opdracht en de meting staan in
     RENDERLIJST-JACHT-OPTIES.md.

     Het zwembad is niet opnieuw gemaakt en hoeft dat niet: dat wordt pas vanaf
     35 meter aangeboden, dus de kleine klasse krijgt hem nooit te zien. */
  function optieOpMaat(optie, model) {
    var k = KLASSE[model];
    if (!k) return false;
    if (k === 'klein') return true;
    return OPTIE_KLASSEN.indexOf(optie + '|' + k) > -1;
  }

  /* Ruimtes aan boord. De salon volgt de keuze van hout en stoffering exact
     — daar staan tweehonderd renders voor klaar. De overige ruimtes doen dat
     niet: één impressie per ruimte in de catalogusafwerking, met een noot
     eronder die dat zegt. Dat is dezelfde afspraak als bij het boven- en
     vooraanzicht, en eerlijker dan doen alsof de eigenaarshut meekleurt.

     `vanaf` is de lengte over alles waaronder een ruimte niet bestaat. Een
     schip van zestien meter heeft geen stuurhuis, geen bioscoop en al
     helemaal geen autogarage; die tonen zou een belofte zijn. */
  var RUIMTEN = [
    { v: 'eigenaarshut', l: 'Eigenaarshut', l_en: 'Owner’s suite',  uit: 'Volle scheepsbreedte, panoramische beglazing.', uit_en: 'Full beam, panoramic glazing.' },
    { v: 'gastenhut',    l: 'Gastenhut', l_en: 'Guest cabin',     uit: 'Eén van de gastenverblijven benedendeks.', uit_en: 'One of the guest cabins below deck.' },
    { v: 'twinhut',      l: 'Twinhut', l_en: 'Twin cabin',       uit: 'Gastenhut met twee losse bedden.', uit_en: 'Guest cabin with two separate berths.', vanaf: 19 },
    { v: 'badkamer',     l: 'Badkamer', l_en: 'Bathroom',      uit: 'De eigenaarsbadkamer in spiegelend marmer.', uit_en: 'The owner’s bathroom in book-matched marble.' },
    { v: 'eetsalon',     l: 'Eetsalon', l_en: 'Dining saloon',      uit: 'Formeel dineren aan boord.', uit_en: 'Formal dining on board.', vanaf: 23 },
    { v: 'kombuis',      l: 'Kombuis', l_en: 'Galley',       uit: 'De werkplek van de kok.', uit_en: 'Where the chef works.', vanaf: 19 },
    { v: 'stuurhuis',    l: 'Stuurhuis', l_en: 'Wheelhouse',     uit: 'Navigatie en besturing.', uit_en: 'Navigation and control.', vanaf: 19 },
    { v: 'skylounge',    l: 'Skylounge', l_en: 'Sky lounge',     uit: 'Bovendekse lounge met bar.', uit_en: 'Upper-deck lounge with bar.', vanaf: 28 },
    { v: 'beachclub',    l: 'Beach club', l_en: 'Beach club',    uit: 'Binnenzwembad met open spiegel.', uit_en: 'Indoor pool with the transom open.', vanaf: 40 },
    { v: 'spa',          l: 'Spa en fitness', l_en: 'Spa and gym', uit: 'Sauna, hammam en fitness.', uit_en: 'Sauna, hammam and gym.', vanaf: 40 },
    { v: 'bioscoop',     l: 'Bioscoop', l_en: 'Cinema',      uit: 'Eigen filmzaal benedendeks.', uit_en: 'A private screening room below deck.', vanaf: 40 },
    /* De autogarage bestaat wél per model: van de vijf schepen vanaf veertig
       meter is er een eigen render, en de garage van een schip van veertig
       meter is nu eenmaal een andere ruimte dan die van honderdtwintig. */
    { v: 'garage',       l: 'Autogarage', l_en: 'Car garage',    uit: 'Ruimte voor je auto\'s aan boord.', uit_en: 'Room for your cars on board.', vanaf: 40, perModel: true },
    { v: 'wijnkelder',   l: 'Wijnkelder', l_en: 'Wine room',    uit: 'Geklimatiseerd, met proeftafel.', uit_en: 'Climate-controlled, with a tasting table.', vanaf: 55 }
  ];

  function ruimtenVoor(loa) {
    return RUIMTEN.filter(function (r) { return !r.vanaf || loa >= r.vanaf; });
  }
  function ruimteBeeld(sleutel, model) {
    for (var i = 0; i < RUIMTEN.length; i++) {
      if (RUIMTEN[i].v !== sleutel) continue;
      if (RUIMTEN[i].perModel) {
        return model ? MAP + 'jacht/ruimte/' + sleutel + '-' + model + '.webp' : null;
      }
      /* Eerst het beeld van dit model zelf: dat is de scherpste die er is.
         Bestaat het niet, dan pas de maatklasse eronder. */
      if (model && RUIMTE_MODELLEN.indexOf(sleutel + '|' + model) > -1) {
        return MAP + 'jacht/ruimte/' + sleutel + '-' + model + '.webp';
      }
      /* Is er een impressie voor de maatklasse van dit model, dan die; anders
         de modelloze, die de kleinste klasse toont. Nooit een klasse-impressie
         van een ander formaat: dan zou een koper van een schip van zestien
         meter de eigenaarshut van honderdtwintig meter zien. */
      var k = KLASSE[model];
      if (k && KLASSE_BEELDEN.indexOf(sleutel + '|' + k) > -1) {
        return MAP + 'jacht/ruimte/' + sleutel + '-' + k + '.webp';
      }
      return MAP + 'jacht/ruimte/' + sleutel + '.webp';
    }
    return null;
  }

  /* Toont deze ruimte-impressie het formaat van dit schip, of het kleinste
     formaat? De configurator zegt dat eerlijk in de noot eronder. */
  function ruimteOpMaat(sleutel, model) {
    /* Een beeld van dit model zelf is per definitie op maat. */
    if (model && RUIMTE_MODELLEN.indexOf(sleutel + '|' + model) > -1) return true;
    var k = KLASSE[model];
    if (!k) return false;
    if (k === 'klein') return true;
    return KLASSE_BEELDEN.indexOf(sleutel + '|' + k) > -1;
  }

  /* De keuzetegels tonen een miniatuur van hooguit 136 bij 59 pixels, maar
     laadden daarvoor de volledige render van 1200 pixels breed: ruim 2 MB aan
     beeldjes ter grootte van een postzegel, elke keer opnieuw. Naast de
     beeldbank staat nu een map `mini` met dezelfde structuur, waarin elke
     render 272 pixels breed is - twee keer de weergavemaat, dus ook scherp op
     een telefoon. Deze functie vertaalt het ene pad in het andere.

     Valt een miniatuur ooit weg, dan komt de volledige render terug: dat is
     zwaarder maar nooit stuk. */
  function miniBeeld(url) {
    return url ? url.replace('jacht/', 'jacht/mini/') : url;
  }

  /* DE MAATKLASSE
     Een eigenaarshut op een schip van honderdtwintig meter is een andere
     ruimte dan die op een schip van zestien: hogere plafonds, meer vloer,
     grotere ramen. Eén impressie voor alle tien de modellen laat dat verschil
     niet zien, en dat is precies het verschil waar een koper voor betaalt.
     Vier klassen is de afweging tussen dat verschil tonen en tien keer
     hetzelfde renderen.

     KLASSE_BEELDEN en OPTIE_KLASSEN worden bijgehouden door
     tools/jacht-klassebeelden-scan.py - niet met de hand wijzigen. */
  var KLASSE = { sc16: 'klein', fb19: 'klein', fb24: 'klein',
                 td29: 'midden', sy37: 'midden', sport40: 'midden',
                 grand55: 'groot', flagship70: 'groot',
                 elite90: 'giga', giga120: 'giga' };
  /* Ruimtes die per model bestaan, fijner dan de maatklasse hierboven. Een
     Grand 55 en een Flagship 70 zitten allebei in de klasse 'groot' terwijl er
     vijftien meter tussen zit: hun skylounge is niet dezelfde ruimte. Staat een
     model hier, dan gaat dat beeld voor op het klassebeeld.

     Wordt bijgehouden door tools/jacht-klassebeelden-scan.py - niet met de hand
     wijzigen. */
  /* De materiaalstalen: een macro-opname per interieurafwerking, zoals de drie
     dekafwerkingen die er al waren. Ze hangen aan de keuze en niet aan het
     schip, dus er is er één per afwerking en niet één per model.

     Ze staan in een eigen lijst en niet in LOS omdat LOS door
     tools/jacht-renderlijst.cjs wordt gezet en die kent deze groep niet. Deze
     lijst wordt bijgehouden door tools/jacht-klassebeelden-scan.py - niet met
     de hand wijzigen.

     Ontbreekt een staal, dan valt de keuzetegel terug op de kleur en de
     materiaalstaat op een gekleurd vlak. Dat blijft kloppen; het is alleen
     minder overtuigend dan de opname. */
  /* De materiaalkamers: de interieurkeuzes in een echte ruimte in plaats van
     als staal op tafel.

     WAAROM DRIE LIJSTEN EN NIET EEN
     Ze volgen elk andere keuzes. De salon volgt hout, stoffering, vloer en
     wandafwerking; de badkamer volgt marmer en metaal; het licht volgt alleen
     de lichtstand. Ze in een lijst gooien zou een sleutel opleveren waar in
     elk van de drie gevallen iets anders in staat.

     WAAROM ZE NIET COMPLEET ZIJN, EN WAAROM DAT GOED IS
     De salon kent 5 x 4 x 4 x 4 = 320 combinaties. Er staan er zeventien: de
     standaard, elke enkele stap opzij, en drie uitersten. Wat er niet staat
     valt terug op de materiaalstaat met de stalen - en dat is een blad dat
     klopt, niet een gat. De rest komt op aanvraag.

     Deze drie worden door tools/jacht-klassebeelden-scan.py bijgehouden. Niet
     met de hand wijzigen. */
  var SALON_BEELDEN = [
    'eiken-zand-teakparket-panelen',
    'essen-offwhite-tapijt-stof',
    'essen-zand-teakparket-panelen',
    'teakhout-cognac-visgraat-panelen',
    'teakhout-zand-teakparket-panelen',
    'walnoot-antraciet-teakparket-panelen',
    'walnoot-cognac-teakparket-panelen',
    'walnoot-offwhite-teakparket-panelen',
    'walnoot-zand-steen-panelen',
    'walnoot-zand-tapijt-panelen',
    'walnoot-zand-teakparket-lak',
    'walnoot-zand-teakparket-leer',
    'walnoot-zand-teakparket-panelen',
    'walnoot-zand-teakparket-stof',
    'walnoot-zand-visgraat-panelen',
    'wenge-antraciet-steen-leer',
    'wenge-zand-teakparket-panelen'
  ];
  var BAD_BEELDEN = [
    'calacatta-brons',
    'calacatta-champagne',
    'calacatta-rvs',
    'calacatta-zwart',
    'emperador-brons',
    'emperador-champagne',
    'emperador-rvs',
    'emperador-zwart',
    'nero-brons',
    'nero-champagne',
    'nero-rvs',
    'nero-zwart',
    'travertijn-brons',
    'travertijn-champagne',
    'travertijn-rvs',
    'travertijn-zwart'
  ];
  var LICHT_BEELDEN = [
    'neutraal',
    'nissen',
    'scenes',
    'warm'
  ];

  var MATERIAAL_BEELDEN = [
    'interieurhout-eiken',
    'interieurhout-essen',
    'interieurhout-teakhout',
    'interieurhout-walnoot',
    'interieurhout-wenge',
    'marmer-calacatta',
    'marmer-emperador',
    'marmer-nero',
    'marmer-travertijn',
    'metaal-brons',
    'metaal-champagne',
    'metaal-rvs',
    'metaal-zwart',
    'stoffering-antraciet',
    'stoffering-cognac',
    'stoffering-offwhite',
    'stoffering-zand',
    'verlichting-neutraal',
    'verlichting-nissen',
    'verlichting-scenes',
    'verlichting-warm',
    'vloer-steen',
    'vloer-tapijt',
    'vloer-teakparket',
    'vloer-visgraat',
    'wandafwerking-lak',
    'wandafwerking-leer',
    'wandafwerking-panelen',
    'wandafwerking-stof'
  ];

  var RUIMTE_MODELLEN = [
    'badkamer|elite90',
    'badkamer|fb19',
    'badkamer|fb24',
    'badkamer|flagship70',
    'badkamer|giga120',
    'badkamer|grand55',
    'badkamer|sc16',
    'badkamer|sport40',
    'badkamer|sy37',
    'badkamer|td29',
    'beachclub|elite90',
    'beachclub|flagship70',
    'beachclub|giga120',
    'beachclub|grand55',
    'beachclub|sport40',
    'bioscoop|elite90',
    'bioscoop|flagship70',
    'bioscoop|giga120',
    'bioscoop|grand55',
    'bioscoop|sport40',
    'eetsalon|elite90',
    'eetsalon|fb24',
    'eetsalon|flagship70',
    'eetsalon|giga120',
    'eetsalon|grand55',
    'eetsalon|sport40',
    'eetsalon|sy37',
    'eetsalon|td29',
    'eigenaarshut|elite90',
    'eigenaarshut|fb19',
    'eigenaarshut|fb24',
    'eigenaarshut|flagship70',
    'eigenaarshut|giga120',
    'eigenaarshut|grand55',
    'eigenaarshut|sc16',
    'eigenaarshut|sport40',
    'eigenaarshut|sy37',
    'eigenaarshut|td29',
    'garage|elite90',
    'garage|flagship70',
    'garage|giga120',
    'garage|grand55',
    'garage|sport40',
    'gastenhut|elite90',
    'gastenhut|fb19',
    'gastenhut|fb24',
    'gastenhut|flagship70',
    'gastenhut|giga120',
    'gastenhut|grand55',
    'gastenhut|sc16',
    'gastenhut|sport40',
    'gastenhut|sy37',
    'gastenhut|td29',
    'kombuis|elite90',
    'kombuis|fb19',
    'kombuis|fb24',
    'kombuis|flagship70',
    'kombuis|giga120',
    'kombuis|grand55',
    'kombuis|sport40',
    'kombuis|sy37',
    'kombuis|td29',
    'skylounge|elite90',
    'skylounge|flagship70',
    'skylounge|giga120',
    'skylounge|grand55',
    'skylounge|sport40',
    'skylounge|sy37',
    'skylounge|td29',
    'spa|elite90',
    'spa|flagship70',
    'spa|giga120',
    'spa|grand55',
    'spa|sport40',
    'stuurhuis|elite90',
    'stuurhuis|fb19',
    'stuurhuis|fb24',
    'stuurhuis|flagship70',
    'stuurhuis|giga120',
    'stuurhuis|grand55',
    'stuurhuis|sport40',
    'stuurhuis|sy37',
    'stuurhuis|td29',
    'twinhut|elite90',
    'twinhut|fb19',
    'twinhut|fb24',
    'twinhut|flagship70',
    'twinhut|giga120',
    'twinhut|grand55',
    'twinhut|sport40',
    'twinhut|sy37',
    'twinhut|td29',
    'wijnkelder|elite90',
    'wijnkelder|flagship70',
    'wijnkelder|giga120',
    'wijnkelder|grand55'
  ];

  var KLASSE_BEELDEN = [
    'badkamer|giga',
    'badkamer|groot',
    'badkamer|midden',
    'beachclub|giga',
    'beachclub|groot',
    'beachclub|midden',
    'bioscoop|giga',
    'bioscoop|groot',
    'bioscoop|midden',
    'eetsalon|giga',
    'eetsalon|groot',
    'eetsalon|midden',
    'eigenaarshut|giga',
    'eigenaarshut|groot',
    'eigenaarshut|midden',
    'gastenhut|giga',
    'gastenhut|groot',
    'gastenhut|midden',
    'kombuis|giga',
    'kombuis|groot',
    'kombuis|midden',
    'skylounge|giga',
    'skylounge|groot',
    'skylounge|midden',
    'spa|giga',
    'spa|groot',
    'spa|midden',
    'stuurhuis|giga',
    'stuurhuis|groot',
    'stuurhuis|midden',
    'twinhut|giga',
    'twinhut|groot',
    'twinhut|midden',
    'wijnkelder|giga',
    'wijnkelder|groot',
    'wijnkelder|midden'
  ];
  var OPTIE_KLASSEN = [
    'airco|giga',
    'airco|groot',
    'airco|midden',
    'boegschroef|giga',
    'boegschroef|groot',
    'boegschroef|midden',
    'jacuzzi|giga',
    'jacuzzi|groot',
    'jacuzzi|midden',
    'onderwaterlicht|giga',
    'onderwaterlicht|groot',
    'onderwaterlicht|midden',
    'satelliet|giga',
    'satelliet|groot',
    'satelliet|midden',
    'stabilisatoren|giga',
    'stabilisatoren|groot',
    'stabilisatoren|midden',
    'tenderkraan|giga',
    'tenderkraan|groot',
    'tenderkraan|midden',
    'watermaker|giga',
    'watermaker|groot',
    'watermaker|midden',
    'zonnepanelen|giga',
    'zonnepanelen|groot',
    'zonnepanelen|midden',
    'zwembad|giga',
    'zwembad|groot',
    'zwembad|midden',
    'zwemplateau|giga',
    'zwemplateau|groot',
    'zwemplateau|midden'
  ];

  /* DE NACHTOPNAME
     Hetzelfde schip, dezelfde camera, met de verlichting aan. Bestaat er geen
     nachtopname voor deze combinatie, dan geeft dit null terug en valt de
     configurator terug op de getekende tekening - die reageert wel op de knop
     Nacht. Een dagrender tonen terwijl de knop op nacht staat is het enige wat
     niet mag: dan doet de knop zichtbaar niets.

     Bijgehouden door tools/jacht-nachtopnames-scan.py - niet met de hand
     wijzigen. Formaat: 'model|dek'. */
  var NACHT = [
    'elite90|flybridge',
    'fb19|flybridge',
    'fb19|hardtop',
    'fb24|flybridge',
    'fb24|flybridge-ttop',
    'flagship70|flybridge',
    'giga120|flybridge',
    'grand55|flybridge',
    'sc16|hardtop',
    'sc16|open',
    'sport40|flybridge',
    'sy37|flybridge',
    'sy37|flybridge-ttop',
    'td29|flybridge',
    'td29|flybridge-ttop'
  ];

  function nachtBeeld(model, dek) {
    return NACHT.indexOf(model + '|' + dek) > -1
      ? MAP + 'jacht/nacht/' + model + '-' + dek + '-nachtblauw-wit.webp' : null;
  }

  global.NGJachtBeelden = { mini: miniBeeld,
                            nacht: nachtBeeld,
                            buiten: buitenBeeld, interieur: interieurBeeld, los: losBeeld,
                            boven: bovenBeeld, voor: voorBeeld, achter: achterBeeld,
                            aanzichtDek: aanzichtDek,
                            optie: optieBeeld,
                            salon: salonBeeld, bad: badBeeld, licht: lichtBeeld,
                            ruimten: ruimtenVoor, ruimte: ruimteBeeld, RUIMTEN: RUIMTEN,
                            ruimteOpMaat: ruimteOpMaat, optieOpMaat: optieOpMaat,
                            klasse: function (m) { return KLASSE[m] || null; },
                            dekking: dekking };
})(typeof window !== 'undefined' ? window : globalThis);
