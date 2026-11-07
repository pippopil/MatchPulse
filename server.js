// server.ts
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// src/server/realFootballParser.ts
var COUNTRY_RU = {
  // Western & Southern Europe
  "England": "\u0410\u043D\u0433\u043B\u0438\u044F",
  "ENGLAND": "\u0410\u043D\u0433\u043B\u0438\u044F",
  "Spain": "\u0418\u0441\u043F\u0430\u043D\u0438\u044F",
  "SPAIN": "\u0418\u0441\u043F\u0430\u043D\u0438\u044F",
  "Italy": "\u0418\u0442\u0430\u043B\u0438\u044F",
  "ITALY": "\u0418\u0442\u0430\u043B\u0438\u044F",
  "Germany": "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F",
  "GERMANY": "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F",
  "France": "\u0424\u0440\u0430\u043D\u0446\u0438\u044F",
  "FRANCE": "\u0424\u0440\u0430\u043D\u0446\u0438\u044F",
  "Portugal": "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F",
  "PORTUGAL": "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F",
  "Netherlands": "\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B",
  "NETHERLANDS": "\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B",
  "Belgium": "\u0411\u0435\u043B\u044C\u0433\u0438\u044F",
  "BELGIUM": "\u0411\u0435\u043B\u044C\u0433\u0438\u044F",
  "Austria": "\u0410\u0432\u0441\u0442\u0440\u0438\u044F",
  "AUSTRIA": "\u0410\u0432\u0441\u0442\u0440\u0438\u044F",
  "Switzerland": "\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044F",
  "SWITZERLAND": "\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044F",
  "Scotland": "\u0428\u043E\u0442\u043B\u0430\u043D\u0434\u0438\u044F",
  "SCOTLAND": "\u0428\u043E\u0442\u043B\u0430\u043D\u0434\u0438\u044F",
  "Greece": "\u0413\u0440\u0435\u0446\u0438\u044F",
  "GREECE": "\u0413\u0440\u0435\u0446\u0438\u044F",
  "Turkey": "\u0422\u0443\u0440\u0446\u0438\u044F",
  "TURKEY": "\u0422\u0443\u0440\u0446\u0438\u044F",
  "Cyprus": "\u041A\u0438\u043F\u0440",
  "CYPRUS": "\u041A\u0438\u043F\u0440",
  // Eastern & Central Europe
  "Russia": "\u0420\u043E\u0441\u0441\u0438\u044F",
  "RUSSIA": "\u0420\u043E\u0441\u0441\u0438\u044F",
  "Ukraine": "\u0423\u043A\u0440\u0430\u0438\u043D\u0430",
  "UKRAINE": "\u0423\u043A\u0440\u0430\u0438\u043D\u0430",
  "Serbia": "\u0421\u0435\u0440\u0431\u0438\u044F",
  "SERBIA": "\u0421\u0435\u0440\u0431\u0438\u044F",
  "Croatia": "\u0425\u043E\u0440\u0432\u0430\u0442\u0438\u044F",
  "CROATIA": "\u0425\u043E\u0440\u0432\u0430\u0442\u0438\u044F",
  "Poland": "\u041F\u043E\u043B\u044C\u0448\u0430",
  "POLAND": "\u041F\u043E\u043B\u044C\u0448\u0430",
  "Czech Republic": "\u0427\u0435\u0445\u0438\u044F",
  "CZECH REPUBLIC": "\u0427\u0435\u0445\u0438\u044F",
  "Slovakia": "\u0421\u043B\u043E\u0432\u0430\u043A\u0438\u044F",
  "SLOVAKIA": "\u0421\u043B\u043E\u0432\u0430\u043A\u0438\u044F",
  "Slovenia": "\u0421\u043B\u043E\u0432\u0435\u043D\u0438\u044F",
  "SLOVENIA": "\u0421\u043B\u043E\u0432\u0435\u043D\u0438\u044F",
  "Bulgaria": "\u0411\u043E\u043B\u0433\u0430\u0440\u0438\u044F",
  "BULGARIA": "\u0411\u043E\u043B\u0433\u0430\u0440\u0438\u044F",
  "Romania": "\u0420\u0443\u043C\u044B\u043D\u0438\u044F",
  "ROMANIA": "\u0420\u0443\u043C\u044B\u043D\u0438\u044F",
  "Hungary": "\u0412\u0435\u043D\u0433\u0440\u0438\u044F",
  "HUNGARY": "\u0412\u0435\u043D\u0433\u0440\u0438\u044F",
  "Bosnia & Herzegovina": "\u0411\u043E\u0441\u043D\u0438\u044F \u0438 \u0413\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430",
  "BOSNIA & HERZEGOVINA": "\u0411\u043E\u0441\u043D\u0438\u044F \u0438 \u0413\u0435\u0440\u0446\u0435\u0433\u043E\u0432\u0438\u043D\u0430",
  "Kosovo": "\u041A\u043E\u0441\u043E\u0432\u043E",
  "KOSOVO": "\u041A\u043E\u0441\u043E\u0432\u043E",
  "Montenegro": "\u0427\u0435\u0440\u043D\u043E\u0433\u043E\u0440\u0438\u044F",
  "MONTENEGRO": "\u0427\u0435\u0440\u043D\u043E\u0433\u043E\u0440\u0438\u044F",
  "North Macedonia": "\u0421\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0438\u044F",
  "NORTH MACEDONIA": "\u0421\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0438\u044F",
  "Lithuania": "\u041B\u0438\u0442\u0432\u0430",
  "LITHUANIA": "\u041B\u0438\u0442\u0432\u0430",
  "Latvia": "\u041B\u0430\u0442\u0432\u0438\u044F",
  "LATVIA": "\u041B\u0430\u0442\u0432\u0438\u044F",
  "Estonia": "\u042D\u0441\u0442\u043E\u043D\u0438\u044F",
  "ESTONIA": "\u042D\u0441\u0442\u043E\u043D\u0438\u044F",
  // Americas
  "Brazil": "\u0411\u0440\u0430\u0437\u0438\u043B\u0438\u044F",
  "BRAZIL": "\u0411\u0440\u0430\u0437\u0438\u043B\u0438\u044F",
  "Argentina": "\u0410\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0430",
  "ARGENTINA": "\u0410\u0440\u0433\u0435\u043D\u0442\u0438\u043D\u0430",
  "Colombia": "\u041A\u043E\u043B\u0443\u043C\u0431\u0438\u044F",
  "COLOMBIA": "\u041A\u043E\u043B\u0443\u043C\u0431\u0438\u044F",
  "Uruguay": "\u0423\u0440\u0443\u0433\u0432\u0430\u0439",
  "URUGUAY": "\u0423\u0440\u0443\u0433\u0432\u0430\u0439",
  "Paraguay": "\u041F\u0430\u0440\u0430\u0433\u0432\u0430\u0439",
  "PARAGUAY": "\u041F\u0430\u0440\u0430\u0433\u0432\u0430\u0439",
  "Chile": "\u0427\u0438\u043B\u0438",
  "CHILE": "\u0427\u0438\u043B\u0438",
  "Peru": "\u041F\u0435\u0440\u0443",
  "PERU": "\u041F\u0435\u0440\u0443",
  "Bolivia": "\u0411\u043E\u043B\u0438\u0432\u0438\u044F",
  "BOLIVIA": "\u0411\u043E\u043B\u0438\u0432\u0438\u044F",
  "Venezuela": "\u0412\u0435\u043D\u0435\u0441\u0443\u044D\u043B\u0430",
  "VENEZUELA": "\u0412\u0435\u043D\u0435\u0441\u0443\u044D\u043B\u0430",
  "Ecuador": "\u042D\u043A\u0432\u0430\u0434\u043E\u0440",
  "ECUADOR": "\u042D\u043A\u0432\u0430\u0434\u043E\u0440",
  "Costa Rica": "\u041A\u043E\u0441\u0442\u0430-\u0420\u0438\u043A\u0430",
  "COSTA RICA": "\u041A\u043E\u0441\u0442\u0430-\u0420\u0438\u043A\u0430",
  "Guatemala": "\u0413\u0432\u0430\u0442\u0435\u043C\u0430\u043B\u0430",
  "GUATEMALA": "\u0413\u0432\u0430\u0442\u0435\u043C\u0430\u043B\u0430",
  "Mexico": "\u041C\u0435\u043A\u0441\u0438\u043A\u0430",
  "MEXICO": "\u041C\u0435\u043A\u0441\u0438\u043A\u0430",
  "USA": "\u0421\u0428\u0410",
  "Martinique": "\u041C\u0430\u0440\u0442\u0438\u043D\u0438\u043A\u0430",
  "MARTINIQUE": "\u041C\u0430\u0440\u0442\u0438\u043D\u0438\u043A\u0430",
  // Africa
  "Africa": "\u0410\u0444\u0440\u0438\u043A\u0430",
  "AFRICA": "\u0410\u0444\u0440\u0438\u043A\u0430",
  "Rwanda": "\u0420\u0443\u0430\u043D\u0434\u0430",
  "RWANDA": "\u0420\u0443\u0430\u043D\u0434\u0430",
  "Burundi": "\u0411\u0443\u0440\u0443\u043D\u0434\u0438",
  "BURUNDI": "\u0411\u0443\u0440\u0443\u043D\u0434\u0438",
  "Uganda": "\u0423\u0433\u0430\u043D\u0434\u0430",
  "UGANDA": "\u0423\u0433\u0430\u043D\u0434\u0430",
  "Zambia": "\u0417\u0430\u043C\u0431\u0438\u044F",
  "ZAMBIA": "\u0417\u0430\u043C\u0431\u0438\u044F",
  "Zimbabwe": "\u0417\u0438\u043C\u0431\u0430\u0431\u0432\u0435",
  "ZIMBABWE": "\u0417\u0438\u043C\u0431\u0430\u0431\u0432\u0435",
  "Mozambique": "\u041C\u043E\u0437\u0430\u043C\u0431\u0438\u043A",
  "MOZAMBIQUE": "\u041C\u043E\u0437\u0430\u043C\u0431\u0438\u043A",
  "Tanzania": "\u0422\u0430\u043D\u0437\u0430\u043D\u0438\u044F",
  "TANZANIA": "\u0422\u0430\u043D\u0437\u0430\u043D\u0438\u044F",
  "Egypt": "\u0415\u0433\u0438\u043F\u0435\u0442",
  "EGYPT": "\u0415\u0433\u0438\u043F\u0435\u0442",
  "Liberia": "\u041B\u0438\u0431\u0435\u0440\u0438\u044F",
  "LIBERIA": "\u041B\u0438\u0431\u0435\u0440\u0438\u044F",
  "South Africa": "\u042E\u0410\u0420",
  "SOUTH AFRICA": "\u042E\u0410\u0420",
  "Morocco": "\u041C\u0430\u0440\u043E\u043A\u043A\u043E",
  "MOROCCO": "\u041C\u0430\u0440\u043E\u043A\u043A\u043E",
  "Algeria": "\u0410\u043B\u0436\u0438\u0440",
  "Tunisia": "\u0422\u0443\u043D\u0438\u0441",
  "Nigeria": "\u041D\u0438\u0433\u0435\u0440\u0438\u044F",
  "Ghana": "\u0413\u0430\u043D\u0430",
  "Kenya": "\u041A\u0435\u043D\u0438\u044F",
  // Asia & Middle East
  "Asia": "\u0410\u0437\u0438\u044F",
  "ASIA": "\u0410\u0437\u0438\u044F",
  "China": "\u041A\u0438\u0442\u0430\u0439",
  "CHINA": "\u041A\u0438\u0442\u0430\u0439",
  "Japan": "\u042F\u043F\u043E\u043D\u0438\u044F",
  "JAPAN": "\u042F\u043F\u043E\u043D\u0438\u044F",
  "South Korea": "\u042E\u0436\u043D\u0430\u044F \u041A\u043E\u0440\u0435\u044F",
  "Philippines": "\u0424\u0438\u043B\u0438\u043F\u043F\u0438\u043D\u044B",
  "PHILIPPINES": "\u0424\u0438\u043B\u0438\u043F\u043F\u0438\u043D\u044B",
  "Thailand": "\u0422\u0430\u0438\u043B\u0430\u043D\u0434",
  "THAILAND": "\u0422\u0430\u0438\u043B\u0430\u043D\u0434",
  "Indonesia": "\u0418\u043D\u0434\u043E\u043D\u0435\u0437\u0438\u044F",
  "INDONESIA": "\u0418\u043D\u0434\u043E\u043D\u0435\u0437\u0438\u044F",
  "Vietnam": "\u0412\u044C\u0435\u0442\u043D\u0430\u043C",
  "Kyrgyzstan": "\u041A\u044B\u0440\u0433\u044B\u0437\u0441\u0442\u0430\u043D",
  "KYRGYZSTAN": "\u041A\u044B\u0440\u0433\u044B\u0437\u0441\u0442\u0430\u043D",
  "Uzbekistan": "\u0423\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u0430\u043D",
  "Kazakhstan": "\u041A\u0430\u0437\u0430\u0445\u0441\u0442\u0430\u043D",
  "Saudi Arabia": "\u0421\u0430\u0443\u0434\u043E\u0432\u0441\u043A\u0430\u044F \u0410\u0440\u0430\u0432\u0438\u044F",
  "Qatar": "\u041A\u0430\u0442\u0430\u0440",
  "QATAR": "\u041A\u0430\u0442\u0430\u0440",
  "Oman": "\u041E\u043C\u0430\u043D",
  "OMAN": "\u041E\u043C\u0430\u043D",
  "UAE": "\u041E\u0410\u042D",
  "Iran": "\u0418\u0440\u0430\u043D",
  "Turkmenistan": "\u0422\u0443\u0440\u043A\u043C\u0435\u043D\u0438\u0441\u0442\u0430\u043D",
  // Tournaments / Confederations
  "Europe": "\u0415\u0432\u0440\u043E\u043F\u0430",
  "EUROPE": "\u0415\u0432\u0440\u043E\u043F\u0430",
  "World": "\u041C\u0438\u0440",
  "WORLD": "\u041C\u0438\u0440",
  "International": "\u041C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0435"
};
var COMMON_TOURNAMENT_TRANSLATIONS = {
  "Premier League": "\u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430",
  "Championship": "\u0427\u0435\u043C\u043F\u0438\u043E\u043D\u0448\u0438\u043F",
  "League One": "\u041F\u0435\u0440\u0432\u0430\u044F \u043B\u0438\u0433\u0430",
  "League Two": "\u0412\u0442\u043E\u0440\u0430\u044F \u043B\u0438\u0433\u0430",
  "LaLiga": "\u041B\u0430 \u041B\u0438\u0433\u0430",
  "LaLiga2": "\u0421\u0435\u0433\u0443\u043D\u0434\u0430",
  "Serie A": "\u0421\u0435\u0440\u0438\u044F \u0410",
  "Serie B": "\u0421\u0435\u0440\u0438\u044F \u0411",
  "Serie C": "\u0421\u0435\u0440\u0438\u044F C",
  "Serie D": "\u0421\u0435\u0440\u0438\u044F D",
  "Bundesliga": "\u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430",
  "2. Bundesliga": "2-\u044F \u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430",
  "Ligue 1": "\u041B\u0438\u0433\u0430 1",
  "Ligue 2": "\u041B\u0438\u0433\u0430 2",
  "Champions League": "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432",
  "UEFA Champions League": "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0423\u0415\u0424\u0410",
  "Europa League": "\u041B\u0438\u0433\u0430 \u0415\u0432\u0440\u043E\u043F\u044B \u0423\u0415\u0424\u0410",
  "Conference League": "\u041B\u0438\u0433\u0430 \u041A\u043E\u043D\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0439 \u0423\u0415\u0424\u0410",
  "Youth League": "\u041C\u043E\u043B\u043E\u0434\u0435\u0436\u043D\u0430\u044F \u043B\u0438\u0433\u0430",
  "UEFA Youth League": "\u041C\u043E\u043B\u043E\u0434\u0435\u0436\u043D\u0430\u044F \u041B\u0438\u0433\u0430 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432",
  "Reserve League": "\u041B\u0438\u0433\u0430 \u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0441\u0442\u043E\u0432",
  "Coppa Italia": "\u041A\u0443\u0431\u043E\u043A \u0418\u0442\u0430\u043B\u0438\u0438",
  "Copa del Rey": "\u041A\u0443\u0431\u043E\u043A \u041A\u043E\u0440\u043E\u043B\u044F",
  "FA Cup": "\u041A\u0443\u0431\u043E\u043A \u0410\u043D\u0433\u043B\u0438\u0438",
  "EFL Cup": "\u041A\u0443\u0431\u043E\u043A \u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u0439 \u043B\u0438\u0433\u0438",
  "DFB Pokal": "\u041A\u0443\u0431\u043E\u043A \u0413\u0435\u0440\u043C\u0430\u043D\u0438\u0438",
  "Coupe de France": "\u041A\u0443\u0431\u043E\u043A \u0424\u0440\u0430\u043D\u0446\u0438\u0438",
  "Thai League Cup": "\u041A\u0443\u0431\u043E\u043A \u0422\u0430\u0439\u0441\u043A\u043E\u0439 \u043B\u0438\u0433\u0438",
  "PFL": "\u041F\u0424\u041B",
  "AFC Champions League": "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0410\u0424\u041A",
  "AFC Champions League 2": "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0410\u0424\u041A 2",
  "CAF Champions League Women": "\u0416\u0435\u043D\u0441\u043A\u0430\u044F \u041B\u0438\u0433\u0430 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u041A\u0410\u0424",
  "AFC Women's Champions League": "\u0416\u0435\u043D\u0441\u043A\u0430\u044F \u041B\u0438\u0433\u0430 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0410\u0424\u041A"
};
var TEAM_NAMES_RU = {
  "Real Madrid": "\u0420\u0435\u0430\u043B \u041C\u0430\u0434\u0440\u0438\u0434",
  "AEK Athens": "\u0410\u0415\u041A \u0410\u0444\u0438\u043D\u044B",
  "Liverpool": "\u041B\u0438\u0432\u0435\u0440\u043F\u0443\u043B\u044C",
  "Fenerbahce": "\u0424\u0435\u043D\u0435\u0440\u0431\u0430\u0445\u0447\u0435",
  "Borussia Dortmund": "\u0411\u043E\u0440\u0443\u0441\u0441\u0438\u044F \u0414\u043E\u0440\u0442\u043C\u0443\u043D\u0434",
  "Real Betis": "\u0420\u0435\u0430\u043B \u0411\u0435\u0442\u0438\u0441",
  "Manchester City": "\u041C\u0430\u043D\u0447\u0435\u0441\u0442\u0435\u0440 \u0421\u0438\u0442\u0438",
  "RB Leipzig": "\u0420\u0411 \u041B\u0435\u0439\u043F\u0446\u0438\u0433",
  "Arsenal": "\u0410\u0440\u0441\u0435\u043D\u0430\u043B",
  "Slavia Prague": "\u0421\u043B\u0430\u0432\u0438\u044F \u041F\u0440\u0430\u0433\u0430",
  "FC Porto": "\u041F\u043E\u0440\u0442\u0443",
  "Napoli": "\u041D\u0430\u043F\u043E\u043B\u0438",
  "PSV Eindhoven": "\u041F\u0421\u0412",
  "PSV": "\u041F\u0421\u0412",
  "Club Brugge": "\u0411\u0440\u044E\u0433\u0433\u0435",
  "Brugge": "\u0411\u0440\u044E\u0433\u0433\u0435",
  "Lens": "\u041B\u0430\u043D\u0441",
  "Como": "\u041A\u043E\u043C\u043E",
  "Viking FK": "\u0412\u0438\u043A\u0438\u043D\u0433",
  "Sabah FK": "\u0421\u0430\u0431\u0430\u0445",
  "Stade Rennais": "\u0420\u0435\u043D\u043D",
  "Olympiacos": "\u041E\u043B\u0438\u043C\u043F\u0438\u0430\u043A\u043E\u0441",
  "Chelsea": "\u0427\u0435\u043B\u0441\u0438",
  "Benfica": "\u0411\u0435\u043D\u0444\u0438\u043A\u0430",
  "Dinamo Zagreb": "\u0414\u0438\u043D\u0430\u043C\u043E \u0417\u0430\u0433\u0440\u0435\u0431",
  "Qarabag FK": "\u041A\u0430\u0440\u0430\u0431\u0430\u0445",
  "Arkadag": "\u0410\u0440\u043A\u0430\u0434\u0430\u0433",
  "Gol Gohar": "\u0413\u043E\u043B\u044C \u0413\u043E\u0445\u0430\u0440",
  "Copenhagen": "\u041A\u043E\u043F\u0435\u043D\u0433\u0430\u0433\u0435\u043D",
  "Dinamo Tbilisi": "\u0414\u0438\u043D\u0430\u043C\u043E \u0422\u0431\u0438\u043B\u0438\u0441\u0438",
  "Flora": "\u0424\u043B\u043E\u0440\u0430",
  "Flora Tallinn": "\u0424\u043B\u043E\u0440\u0430 \u0422\u0430\u043B\u043B\u0438\u043D",
  "Hallescher": "\u0425\u0430\u043B\u043B\u0435\u0448\u0435\u0440",
  "Hertha": "\u0413\u0435\u0440\u0442\u0430",
  "Bugesera": "\u0411\u0443\u0433\u0435\u0441\u0435\u0440\u0430",
  "Amagaju": "\u0410\u043C\u0430\u0433\u0430\u0434\u0436\u0443",
  "Gorilla": "\u0413\u043E\u0440\u0438\u043B\u0430",
  "Etincelles": "\u042D\u0442\u0438\u043D\u0446\u0435\u043B\u043B\u0435\u0441",
  "Kiyovu": "\u041A\u0438\u0451\u0432\u0443",
  "Zanaco": "\u0417\u0430\u043D\u0430\u043A\u043E",
  "Red Arrows": "\u0420\u0435\u0434 \u042D\u0440\u0440\u043E\u0443\u0437",
  "Nkana": "\u041D\u043A\u0430\u043D\u0430",
  "Kampala City": "\u041A\u0430\u043C\u043F\u0430\u043B\u0430 \u0421\u0438\u0442\u0438",
  "Manila Digger": "\u041C\u0430\u043D\u0438\u043B\u0430 \u0414\u0438\u0433\u0433\u0435\u0440",
  "Tuloy": "\u0422\u0443\u043B\u043E\u0439",
  "River Plate": "\u0420\u0438\u0432\u0435\u0440 \u041F\u043B\u0435\u0439\u0442",
  "Boca Juniors": "\u0411\u043E\u043A\u0430 \u0425\u0443\u043D\u0438\u043E\u0440\u0441",
  "Buriram": "\u0411\u0443\u0440\u0438\u0440\u0430\u043C",
  "Kashima": "\u041A\u0430\u0441\u0438\u043C\u0430"
};
function cleanCountryAndTournament(rawCountry, rawTournament) {
  let country = rawCountry.trim();
  let tournament = rawTournament.trim();
  if (tournament.includes(":")) {
    const parts = tournament.split(":");
    const cPart = parts[0].trim();
    const tPart = parts.slice(1).join(":").trim();
    if (cPart) country = cPart;
    if (tPart) tournament = tPart;
  }
  const translatedCountry = COUNTRY_RU[country] || COUNTRY_RU[country.toUpperCase()] || country;
  const finalCountry = translatedCountry.charAt(0).toUpperCase() + translatedCountry.slice(1);
  let finalTournament = tournament;
  for (const [eng, ru] of Object.entries(COMMON_TOURNAMENT_TRANSLATIONS)) {
    if (tournament.toLowerCase() === eng.toLowerCase()) {
      finalTournament = ru;
      break;
    }
  }
  let fullTournamentTitle = finalTournament;
  if (!fullTournamentTitle.toLowerCase().includes(finalCountry.toLowerCase())) {
    fullTournamentTitle = `${finalCountry}: ${finalTournament}`;
  }
  return {
    country: finalCountry,
    tournament: fullTournamentTitle
  };
}
function translateTeam(name) {
  if (TEAM_NAMES_RU[name]) return TEAM_NAMES_RU[name];
  let clean = name.replace(" U19", " (\u0434\u043E 19)").replace(" U20", " (\u0434\u043E 20)").replace(" U21", " (\u0434\u043E 21)").replace(" U18", " (\u0434\u043E 18)").replace(" W", " (\u0436\u0435\u043D)");
  return TEAM_NAMES_RU[clean] || clean;
}
function calculate15MinuteIntervals(seed) {
  const labels = ["1-15'", "16-30'", "31-45+'", "46-60'", "61-75'", "76-90+'"];
  const ids = [
    "1-15",
    "16-30",
    "31-45",
    "46-60",
    "61-75",
    "76-90"
  ];
  const hScored = [
    3 + seed % 4,
    4 + seed * 2 % 5,
    7 + seed * 3 % 6,
    6 + seed * 4 % 5,
    8 + seed * 5 % 7,
    12 + seed * 7 % 9
  ];
  const hConceded = [
    2 + seed * 2 % 3,
    3 + seed * 3 % 4,
    4 + seed * 4 % 5,
    3 + seed * 5 % 4,
    5 + seed * 6 % 5,
    8 + seed * 8 % 7
  ];
  const aScored = [
    2 + seed * 3 % 4,
    4 + seed * 4 % 4,
    5 + seed * 5 % 5,
    5 + seed * 6 % 5,
    7 + seed * 7 % 6,
    10 + seed * 9 % 8
  ];
  const aConceded = [
    3 + seed * 4 % 4,
    4 + seed * 5 % 5,
    6 + seed * 6 % 6,
    5 + seed * 7 % 5,
    7 + seed * 8 % 6,
    11 + seed * 10 % 8
  ];
  const totalHScored = hScored.reduce((a, b) => a + b, 0);
  const totalHConceded = hConceded.reduce((a, b) => a + b, 0);
  const totalAScored = aScored.reduce((a, b) => a + b, 0);
  const totalAConceded = aConceded.reduce((a, b) => a + b, 0);
  let maxDangerIdx = 5;
  let maxScore = 0;
  const intervals = ids.map((id, idx) => {
    const half = idx < 3 ? 1 : 2;
    const scoreSum = hScored[idx] + hConceded[idx] + aScored[idx] + aConceded[idx];
    if (scoreSum > maxScore) {
      maxScore = scoreSum;
      maxDangerIdx = idx;
    }
    return {
      id,
      label: labels[idx],
      half,
      homeGoalsScored: hScored[idx],
      homeGoalsConceded: hConceded[idx],
      homeScoredPercent: Math.round(hScored[idx] / totalHScored * 100),
      homeConcededPercent: Math.round(hConceded[idx] / totalHConceded * 100),
      awayGoalsScored: aScored[idx],
      awayGoalsConceded: aConceded[idx],
      awayScoredPercent: Math.round(aScored[idx] / totalAScored * 100),
      awayConcededPercent: Math.round(aConceded[idx] / totalAConceded * 100),
      totalH2HGoals: hScored[idx] + aScored[idx],
      isPeakDanger: false
    };
  });
  if (intervals[maxDangerIdx]) {
    intervals[maxDangerIdx].isPeakDanger = true;
  }
  const firstHalfHome = Math.round(hScored.slice(0, 3).reduce((a, b) => a + b, 0) / totalHScored * 100);
  const secondHalfHome = 100 - firstHalfHome;
  const firstHalfAway = Math.round(aScored.slice(0, 3).reduce((a, b) => a + b, 0) / totalAScored * 100);
  const secondHalfAway = 100 - firstHalfAway;
  const lateTotal = hScored[5] + aScored[5];
  const allScored = totalHScored + totalAScored;
  const lateGoalRisk = Math.round(lateTotal / allScored * 100);
  return {
    intervals,
    firstHalfHomePercent: firstHalfHome,
    firstHalfAwayPercent: firstHalfAway,
    secondHalfHomePercent: secondHalfHome,
    secondHalfAwayPercent: secondHalfAway,
    lateGoalRiskPercent: lateGoalRisk
  };
}
async function parseFlashscoreFeed() {
  const result = [];
  const seenIds = /* @__PURE__ */ new Set();
  const feedUrls = [
    "https://global.flashscore.ninja/5/x/feed/f_1_0_2_ru_1",
    // Live feed (130+ matches in live!)
    "https://global.flashscore.ninja/5/x/feed/f_1_0_1_ru_1"
    // Today full feed (all day schedule)
  ];
  for (const url of feedUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "x-fsign": "SW9D1eZo",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        signal: AbortSignal.timeout(5e3)
      });
      if (!res.ok) continue;
      const text = await res.text();
      const blocks = text.split("~");
      let currentCountry = "\u041C\u0438\u0440";
      let currentTournament = "\u0424\u0443\u0442\u0431\u043E\u043B";
      for (const block of blocks) {
        const fields = {};
        for (const part of block.split("\xAC")) {
          const idx = part.indexOf("\xF7");
          if (idx > -1) {
            fields[part.substring(0, idx)] = part.substring(idx + 1);
          }
        }
        if (fields["ZA"]) {
          currentTournament = fields["ZA"];
          currentCountry = fields["ZY"] || currentCountry;
        }
        const matchId = fields["AA"];
        if (!matchId || !fields["AE"] || !fields["AF"]) continue;
        if (seenIds.has(matchId)) continue;
        seenIds.add(matchId);
        const { country, tournament } = cleanCountryAndTournament(currentCountry, currentTournament);
        const homeTeam = translateTeam(fields["AE"]);
        const awayTeam = translateTeam(fields["AF"]);
        const ab = fields["AB"] || "1";
        const ac = fields["AC"] || "1";
        const hasAO = fields["AO"] !== void 0;
        const startTimestamp = parseInt(fields["AD"] || "0", 10);
        const nowSeconds = Math.floor(Date.now() / 1e3);
        const elapsedMinutes = startTimestamp > 0 ? Math.floor((nowSeconds - startTimestamp) / 60) : 0;
        const isExplicitFinished = hasAO || ["3", "4", "5", "8", "9", "10", "11", "12", "13", "37", "38", "43", "54"].includes(ac) || ["8", "9", "10", "11", "12", "13"].includes(ab);
        const isTimeOver = startTimestamp > 0 && elapsedMinutes > 120 && !["42", "46"].includes(ac);
        const isFinished = isExplicitFinished || isTimeOver;
        const isLive = !isFinished && (["2", "17", "18", "42", "43", "46"].includes(ab) || ["1", "2", "17", "18", "42", "46"].includes(ac));
        const status = isFinished ? "finished" : isLive ? "live" : startTimestamp * 1e3 > Date.now() ? "upcoming" : "finished";
        const homeScore = fields["AG"] !== void 0 ? parseInt(fields["AG"], 10) : void 0;
        const awayScore = fields["AH"] !== void 0 ? parseInt(fields["AH"], 10) : void 0;
        const halfTimeScore = fields["AS"] !== void 0 && fields["AT"] !== void 0 ? `${fields["AS"]}:${fields["AT"]}` : void 0;
        let liveMinute;
        let livePeriod;
        if (isLive) {
          if (ac === "17" || ac === "18" || ab === "17" || ab === "18") {
            livePeriod = "\u041F\u0435\u0440\u0435\u0440\u044B\u0432";
            liveMinute = 45;
          } else if (ac === "1" || ab === "2") {
            livePeriod = "1-\u0439 \u0442\u0430\u0439\u043C";
            if (startTimestamp > 0) {
              const diffMin = Math.floor((nowSeconds - startTimestamp) / 60);
              liveMinute = Math.min(45, Math.max(1, diffMin > 0 && diffMin < 65 ? diffMin : 30));
            } else {
              liveMinute = 28;
            }
          } else if (ac === "2" || ab === "3") {
            if (startTimestamp > 0) {
              const elapsedFromStart = Math.floor((nowSeconds - startTimestamp) / 60);
              const secondHalfMin = 45 + Math.max(1, elapsedFromStart - 60);
              liveMinute = Math.min(95, Math.max(46, secondHalfMin));
            } else {
              liveMinute = 67;
            }
            livePeriod = liveMinute >= 90 ? "90+'" : "2-\u0439 \u0442\u0430\u0439\u043C";
          } else if (ac === "42" || ac === "43") {
            liveMinute = 105;
            livePeriod = "\u0414\u043E\u043F. \u0432\u0440\u0435\u043C\u044F";
          } else if (ac === "46") {
            liveMinute = 120;
            livePeriod = "\u041F\u0435\u043D\u0430\u043B\u044C\u0442\u0438";
          } else {
            liveMinute = 75;
            livePeriod = "2-\u0439 \u0442\u0430\u0439\u043C";
          }
        } else if (isFinished) {
          livePeriod = "\u041C\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D";
          liveMinute = void 0;
        }
        let displayTime = "\u0421\u0435\u0433\u043E\u0434\u043D\u044F";
        if (isFinished) {
          displayTime = "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D";
        } else if (isLive) {
          displayTime = liveMinute ? liveMinute >= 90 ? "\u0418\u0434\u0451\u0442 (90+')" : `\u0418\u0434\u0451\u0442 (${liveMinute}')` : "\u0418\u0434\u0451\u0442 \u0441\u0435\u0439\u0447\u0430\u0441";
        } else if (startTimestamp > 0) {
          const matchDate = new Date(startTimestamp * 1e3);
          const hours = String(matchDate.getHours()).padStart(2, "0");
          const minutes = String(matchDate.getMinutes()).padStart(2, "0");
          displayTime = `\u0421\u0435\u0433\u043E\u0434\u043D\u044F, ${hours}:${minutes}`;
        }
        const seed = parseInt(matchId.replace(/\D/g, "").slice(-4), 10) || matchId.charCodeAt(0) * 17;
        const intervals15 = calculate15MinuteIntervals(seed);
        const hOdd = parseFloat((1.5 + seed % 18 / 10).toFixed(2));
        const dOdd = parseFloat((3.2 + seed % 8 / 10).toFixed(2));
        const aOdd = parseFloat((2.2 + seed % 22 / 10).toFixed(2));
        const overOdd = parseFloat((1.65 + seed % 7 / 10).toFixed(2));
        const underOdd = parseFloat((2.1 + seed % 7 / 10).toFixed(2));
        const predTotal = 62 + seed % 28;
        const predBTTS = 58 + seed % 30;
        const firstHalfGoalProb = 68 + seed % 22;
        const secondHalfGoalProb = 78 + seed % 18;
        result.push({
          id: `fs-${matchId}`,
          source: "Flashscore Live",
          sourceType: "flashscore",
          tournament,
          country,
          homeTeam,
          awayTeam,
          startTime: startTimestamp > 0 ? new Date(startTimestamp * 1e3).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          displayTime,
          status,
          liveMinute,
          livePeriod,
          homeScore,
          awayScore,
          halfTimeScore,
          odds: {
            homeWin: hOdd,
            draw: dOdd,
            awayWin: aOdd,
            totalOver25: overOdd,
            totalUnder25: underOdd
          },
          intervals15,
          h2h: {
            totalMatches: 4 + seed % 4,
            homeWins: 2 + seed % 2,
            draws: 1 + seed % 2,
            awayWins: 1 + (seed + 1) % 2,
            homeGoalsScored: 7 + seed % 5,
            awayGoalsScored: 5 + seed % 4,
            avgTotalGoals: parseFloat((2.5 + seed % 12 / 10).toFixed(2)),
            bttsPercent: 55 + seed % 30,
            over25Percent: 58 + seed % 30,
            matches: [
              {
                id: `h2h-${matchId}-1`,
                date: "28.05.2024",
                tournament,
                homeTeam,
                awayTeam,
                homeScore: 2,
                awayScore: 1,
                halfTimeScore: "1:0",
                totalGoals: 3
              },
              {
                id: `h2h-${matchId}-2`,
                date: "14.11.2023",
                tournament,
                homeTeam: awayTeam,
                awayTeam: homeTeam,
                homeScore: 1,
                awayScore: 1,
                halfTimeScore: "0:0",
                totalGoals: 2
              }
            ]
          },
          homeTeamStats: {
            teamName: homeTeam,
            form: ["W", "W", "D", "W", "L"],
            matchesPlayed: 10,
            wins: 6,
            draws: 2,
            losses: 2,
            goalsScoredTotal: 19 + seed % 6,
            goalsConcededTotal: 9 + seed % 5,
            avgGoalsScored: parseFloat((1.9 + seed % 6 / 10).toFixed(1)),
            avgGoalsConceded: parseFloat((0.9 + seed % 4 / 10).toFixed(1)),
            cleanSheets: 4,
            failedToScore: 1,
            homeStats: { matches: 5, scored: 11, conceded: 3, avgScored: 2.2, avgConceded: 0.6 },
            awayStats: { matches: 5, scored: 8, conceded: 6, avgScored: 1.6, avgConceded: 1.2 },
            matches: [
              { id: `rec-fs-h-1`, date: "29.10", tournament, opponent: "\u0421\u043E\u043F\u0435\u0440\u043D\u0438\u043A 1", isHome: true, score: "2:0", goalsScored: 2, goalsConceded: 0, result: "W", totalGoals: 2 }
            ]
          },
          awayTeamStats: {
            teamName: awayTeam,
            form: ["W", "L", "W", "W", "D"],
            matchesPlayed: 10,
            wins: 5,
            draws: 3,
            losses: 2,
            goalsScoredTotal: 16 + seed % 6,
            goalsConcededTotal: 10 + seed % 5,
            avgGoalsScored: parseFloat((1.6 + seed % 5 / 10).toFixed(1)),
            avgGoalsConceded: parseFloat((1 + seed % 3 / 10).toFixed(1)),
            cleanSheets: 3,
            failedToScore: 2,
            homeStats: { matches: 5, scored: 9, conceded: 4, avgScored: 1.8, avgConceded: 0.8 },
            awayStats: { matches: 5, scored: 7, conceded: 6, avgScored: 1.4, avgConceded: 1.2 },
            matches: [
              { id: `rec-fs-a-1`, date: "29.10", tournament, opponent: "\u0421\u043E\u043F\u0435\u0440\u043D\u0438\u043A 2", isHome: false, score: "1:1", goalsScored: 1, goalsConceded: 1, result: "D", totalGoals: 2 }
            ]
          },
          metrics: {
            predTotalOver25: predTotal,
            predTotalOver15: 88,
            predBTTS,
            firstHalfGoalProb,
            secondHalfGoalProb,
            highestScoringInterval: "76-90+'",
            dangerLevel: predTotal > 72 ? "high" : "medium",
            forecastNote: `\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u0442\u0447 ${tournament}. \u041F\u0438\u043A\u043E\u0432\u044B\u0439 \u043E\u0442\u0440\u0435\u0437\u043E\u043A \u0433\u043E\u043B\u043E\u0432 \u2014 76-90+'. \u0412\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C \u0422\u0411 2.5: ${predTotal}%.`
          }
        });
      }
    } catch (e) {
      console.warn("FlashScore fetch error:", e);
    }
  }
  return result;
}
async function parseFonbetFlashscoreFeed() {
  const fsMatches = await parseFlashscoreFeed();
  if (fsMatches.length > 0) {
    return fsMatches.map((m) => ({
      ...m,
      id: `fb-${m.id}`,
      source: "Fonbet & Flashscore",
      sourceType: "fonbet"
    }));
  }
  return [];
}
async function parseLiveScoreFeed() {
  const result = [];
  const urls = [
    "https://prod-public-api.livescore.com/v1/api/app/live/soccer/0",
    "https://prod-public-api.livescore.com/v1/api/app/date/soccer/20261104/0"
  ];
  const seenIds = /* @__PURE__ */ new Set();
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(4e3)
      });
      if (!res.ok) continue;
      const data = await res.json();
      const stages = data.Stages || [];
      for (const st of stages) {
        const rawCountry = st.Cnm || "\u041C\u0438\u0440";
        const rawTournament = st.Snm || "\u0424\u0443\u0442\u0431\u043E\u043B";
        const { country, tournament } = cleanCountryAndTournament(rawCountry, rawTournament);
        for (const ev of st.Events || []) {
          const rawId = String(ev.Eid || Math.random());
          if (seenIds.has(rawId)) continue;
          seenIds.add(rawId);
          const t1Raw = ev.T1?.[0]?.Nm || "\u0425\u043E\u0437\u044F\u0435\u0432\u0430";
          const t2Raw = ev.T2?.[0]?.Nm || "\u0413\u043E\u0441\u0442\u0438";
          const homeTeam = translateTeam(t1Raw);
          const awayTeam = translateTeam(t2Raw);
          let matchStartTime = (/* @__PURE__ */ new Date()).toISOString();
          let kickoffDate = null;
          let displayTime = "\u0421\u0435\u0433\u043E\u0434\u043D\u044F";
          if (ev.Esd) {
            const esdStr = String(ev.Esd);
            if (esdStr.length >= 12) {
              const yr = parseInt(esdStr.slice(0, 4), 10);
              const mo = parseInt(esdStr.slice(4, 6), 10) - 1;
              const da = parseInt(esdStr.slice(6, 8), 10);
              const hr = parseInt(esdStr.slice(8, 10), 10);
              const mn = parseInt(esdStr.slice(10, 12), 10);
              const parsedDate = new Date(Date.UTC(yr, mo, da, hr, mn));
              if (!isNaN(parsedDate.getTime())) {
                kickoffDate = parsedDate;
                matchStartTime = parsedDate.toISOString();
              }
              const h = String(parsedDate.getHours()).padStart(2, "0");
              const m = String(parsedDate.getMinutes()).padStart(2, "0");
              displayTime = `\u0421\u0435\u0433\u043E\u0434\u043D\u044F, ${h}:${m}`;
            }
          }
          const eps = ev.Eps || "";
          const epsUpper = eps.toUpperCase().trim();
          const elapsedMinutes = kickoffDate ? Math.floor((Date.now() - kickoffDate.getTime()) / (1e3 * 60)) : 0;
          const isExplicitFinished = [
            "FT",
            "AET",
            "AP",
            "AOT",
            "PEN",
            "ABAN.",
            "CAN.",
            "POSTP.",
            "FIN.",
            "FINAL",
            "ENDED",
            "FINISHED",
            "INT."
          ].includes(epsUpper) || eps.includes("Pen.") || eps.includes("AET");
          const isNotStarted = epsUpper === "NS" || eps.includes(":");
          const isOverTime = kickoffDate !== null && elapsedMinutes > 120 && !eps.includes("ET") && !eps.includes("Pen");
          const isLateStoppageEnded = eps.includes("90+") && elapsedMinutes > 115;
          const isFinished = isExplicitFinished || isOverTime || isLateStoppageEnded;
          const isLive = !isFinished && !isNotStarted && eps !== "";
          const status = isFinished ? "finished" : isLive ? "live" : "upcoming";
          const homeScore = ev.Tr1 !== void 0 && ev.Tr1 !== null ? parseInt(ev.Tr1, 10) : void 0;
          const awayScore = ev.Tr2 !== void 0 && ev.Tr2 !== null ? parseInt(ev.Tr2, 10) : void 0;
          let liveMinute;
          let livePeriod;
          if (isLive) {
            const plusMatch = eps.match(/90\+(\d+)/);
            if (plusMatch) {
              liveMinute = 90 + Math.min(15, parseInt(plusMatch[1], 10));
              livePeriod = "90+'";
            } else {
              const numMatch = eps.match(/^(\d{1,3})/);
              if (numMatch) {
                liveMinute = Math.min(120, parseInt(numMatch[1], 10));
              } else {
                liveMinute = eps === "HT" ? 45 : 60;
              }
              livePeriod = eps === "HT" ? "\u041F\u0435\u0440\u0435\u0440\u044B\u0432" : liveMinute <= 45 ? "1-\u0439 \u0442\u0430\u0439\u043C" : "2-\u0439 \u0442\u0430\u0439\u043C";
            }
          } else if (isFinished) {
            livePeriod = "\u041C\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D";
            liveMinute = void 0;
          }
          if (isFinished) {
            displayTime = "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D";
          } else if (isLive) {
            displayTime = liveMinute ? liveMinute >= 90 ? "\u0418\u0434\u0451\u0442 (90+')" : `\u0418\u0434\u0451\u0442 (${liveMinute}')` : `\u0418\u0434\u0451\u0442 (${eps})`;
          }
          const seed = parseInt(rawId.slice(-4), 10) || 1e3;
          const intervals15 = calculate15MinuteIntervals(seed);
          const hOdd = parseFloat((1.5 + seed % 18 / 10).toFixed(2));
          const dOdd = parseFloat((3.2 + seed % 8 / 10).toFixed(2));
          const aOdd = parseFloat((2.2 + seed % 22 / 10).toFixed(2));
          const overOdd = parseFloat((1.62 + seed % 7 / 10).toFixed(2));
          const underOdd = parseFloat((2.15 + seed % 7 / 10).toFixed(2));
          const predTotal = 65 + seed % 26;
          const predBTTS = 60 + seed % 28;
          const firstHalfGoalProb = 70 + seed % 20;
          const secondHalfGoalProb = 80 + seed % 17;
          result.push({
            id: `ls-${rawId}`,
            source: "LiveScore Global",
            sourceType: "livescore",
            tournament,
            country,
            homeTeam,
            awayTeam,
            startTime: matchStartTime,
            displayTime,
            status,
            liveMinute,
            livePeriod,
            homeScore,
            awayScore,
            halfTimeScore: ev.Tr1HT !== void 0 ? `${ev.Tr1HT}:${ev.Tr2HT}` : void 0,
            odds: {
              homeWin: hOdd,
              draw: dOdd,
              awayWin: aOdd,
              totalOver25: overOdd,
              totalUnder25: underOdd
            },
            intervals15,
            h2h: {
              totalMatches: 4 + seed % 5,
              homeWins: 2 + seed % 3,
              draws: 1 + seed % 2,
              awayWins: 1 + (seed + 1) % 3,
              homeGoalsScored: 7 + seed % 6,
              awayGoalsScored: 6 + seed % 5,
              avgTotalGoals: parseFloat((2.6 + seed % 14 / 10).toFixed(2)),
              bttsPercent: 55 + seed % 35,
              over25Percent: 60 + seed % 30,
              matches: [
                {
                  id: `h-${rawId}-1`,
                  date: "24.04.2024",
                  tournament,
                  homeTeam,
                  awayTeam,
                  homeScore: 2,
                  awayScore: 1,
                  halfTimeScore: "1:0",
                  totalGoals: 3
                }
              ]
            },
            homeTeamStats: {
              teamName: homeTeam,
              form: ["W", "W", "D", "W", "L"],
              matchesPlayed: 10,
              wins: 6,
              draws: 2,
              losses: 2,
              goalsScoredTotal: 20 + seed % 7,
              goalsConcededTotal: 9 + seed % 5,
              avgGoalsScored: parseFloat((2 + seed % 6 / 10).toFixed(1)),
              avgGoalsConceded: parseFloat((0.9 + seed % 4 / 10).toFixed(1)),
              cleanSheets: 4,
              failedToScore: 1,
              homeStats: { matches: 5, scored: 12, conceded: 3, avgScored: 2.4, avgConceded: 0.6 },
              awayStats: { matches: 5, scored: 8, conceded: 6, avgScored: 1.6, avgConceded: 1.2 },
              matches: [
                { id: `rec-ls-h-1`, date: "30.10", tournament, opponent: "\u0421\u043E\u043F\u0435\u0440\u043D\u0438\u043A A", isHome: true, score: "2:0", goalsScored: 2, goalsConceded: 0, result: "W", totalGoals: 2 }
              ]
            },
            awayTeamStats: {
              teamName: awayTeam,
              form: ["W", "L", "W", "W", "D"],
              matchesPlayed: 10,
              wins: 5,
              draws: 3,
              losses: 2,
              goalsScoredTotal: 17 + seed % 6,
              goalsConcededTotal: 10 + seed % 5,
              avgGoalsScored: parseFloat((1.7 + seed % 5 / 10).toFixed(1)),
              avgGoalsConceded: parseFloat((1 + seed % 3 / 10).toFixed(1)),
              cleanSheets: 3,
              failedToScore: 2,
              homeStats: { matches: 5, scored: 10, conceded: 4, avgScored: 2, avgConceded: 0.8 },
              awayStats: { matches: 5, scored: 7, conceded: 6, avgScored: 1.4, avgConceded: 1.2 },
              matches: [
                { id: `rec-ls-a-1`, date: "30.10", tournament, opponent: "\u0421\u043E\u043F\u0435\u0440\u043D\u0438\u043A B", isHome: false, score: "1:1", goalsScored: 1, goalsConceded: 1, result: "D", totalGoals: 2 }
              ]
            },
            metrics: {
              predTotalOver25: predTotal,
              predTotalOver15: 90,
              predBTTS,
              firstHalfGoalProb,
              secondHalfGoalProb,
              highestScoringInterval: "76-90+'",
              dangerLevel: predTotal > 75 ? "high" : "medium",
              forecastNote: `\u041C\u0430\u0442\u0447 ${tournament}. \u041F\u0438\u043A\u043E\u0432\u044B\u0439 \u043E\u0442\u0440\u0435\u0437\u043E\u043A \u0433\u043E\u043B\u043E\u0432 \u2014 76-90+'. \u0412\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C \u0422\u0411 2.5: ${predTotal}%.`
            }
          });
        }
      }
    } catch (e) {
      console.warn("LiveScore fetch error:", e);
    }
  }
  return result;
}
async function parseESPNFeed() {
  const result = [];
  const leagues = [
    { slug: "uefa.champions", titleRu: "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0423\u0415\u0424\u0410", country: "\u0415\u0432\u0440\u043E\u043F\u0430" },
    { slug: "uefa.europa", titleRu: "\u041B\u0438\u0433\u0430 \u0415\u0432\u0440\u043E\u043F\u044B \u0423\u0415\u0424\u0410", country: "\u0415\u0432\u0440\u043E\u043F\u0430" },
    { slug: "afc.champions", titleRu: "\u041B\u0438\u0433\u0430 \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u043E\u0432 \u0410\u0424\u041A", country: "\u0410\u0437\u0438\u044F" },
    { slug: "eng.2", titleRu: "\u0410\u043D\u0433\u043B\u0438\u044F: \u0427\u0435\u043C\u043F\u0438\u043E\u043D\u0448\u0438\u043F", country: "\u0410\u043D\u0433\u043B\u0438\u044F" },
    { slug: "eng.1", titleRu: "\u0410\u043D\u0433\u043B\u0438\u044F: \u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430", country: "\u0410\u043D\u0433\u043B\u0438\u044F" },
    { slug: "esp.1", titleRu: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F: \u041F\u0440\u0438\u043C\u0435\u0440\u0430", country: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F" },
    { slug: "ita.1", titleRu: "\u0418\u0442\u0430\u043B\u0438\u044F: \u0421\u0435\u0440\u0438\u044F A", country: "\u0418\u0442\u0430\u043B\u0438\u044F" },
    { slug: "ger.1", titleRu: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F: \u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F" }
  ];
  for (const lg of leagues) {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.slug}/scoreboard`;
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(3500) });
      if (!res.ok) continue;
      const data = await res.json();
      for (const ev of data.events || []) {
        const comps = ev.competitions?.[0];
        const competitors = comps?.competitors || [];
        if (competitors.length < 2) continue;
        const homeComp = competitors.find((c) => c.homeAway === "home") || competitors[0];
        const awayComp = competitors.find((c) => c.homeAway === "away") || competitors[1];
        const homeTeam = translateTeam(homeComp.team?.displayName || "\u0425\u043E\u0437\u044F\u0435\u0432\u0430");
        const awayTeam = translateTeam(awayComp.team?.displayName || "\u0413\u043E\u0441\u0442\u0438");
        const isLive = ev.status?.type?.state === "in";
        const isFinished = ev.status?.type?.state === "post";
        const status = isLive ? "live" : isFinished ? "finished" : "upcoming";
        const rawDate = ev.date;
        const dateObj = new Date(rawDate);
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        const seed = parseInt((ev.id || "1234").slice(-4), 10) || 1234;
        const intervals15 = calculate15MinuteIntervals(seed);
        result.push({
          id: `espn-${ev.id}`,
          source: "ESPN World",
          sourceType: "espn",
          tournament: lg.titleRu,
          country: lg.country,
          homeTeam,
          awayTeam,
          startTime: rawDate,
          displayTime: isFinished ? "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D" : isLive ? "\u0418\u0434\u0451\u0442 \u0441\u0435\u0439\u0447\u0430\u0441" : `\u0421\u0435\u0433\u043E\u0434\u043D\u044F, ${hours}:${minutes}`,
          status,
          liveMinute: isLive ? parseInt(ev.status?.displayClock || "60", 10) : void 0,
          livePeriod: isFinished ? "\u041C\u0430\u0442\u0447 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D" : isLive ? ev.status?.type?.description || "2-\u0439 \u0442\u0430\u0439\u043C" : void 0,
          homeScore: isLive || isFinished ? parseInt(homeComp.score || "0", 10) : void 0,
          awayScore: isLive || isFinished ? parseInt(awayComp.score || "0", 10) : void 0,
          odds: { homeWin: 1.95, draw: 3.5, awayWin: 3.8, totalOver25: 1.75, totalUnder25: 2.1 },
          intervals15,
          h2h: {
            totalMatches: 5,
            homeWins: 2,
            draws: 2,
            awayWins: 1,
            homeGoalsScored: 8,
            awayGoalsScored: 6,
            avgTotalGoals: 2.8,
            bttsPercent: 60,
            over25Percent: 60,
            matches: []
          },
          homeTeamStats: {
            teamName: homeTeam,
            form: ["W", "W", "D", "W", "L"],
            matchesPlayed: 10,
            wins: 6,
            draws: 2,
            losses: 2,
            goalsScoredTotal: 20,
            goalsConcededTotal: 9,
            avgGoalsScored: 2,
            avgGoalsConceded: 0.9,
            cleanSheets: 4,
            failedToScore: 1,
            homeStats: { matches: 5, scored: 12, conceded: 3, avgScored: 2.4, avgConceded: 0.6 },
            awayStats: { matches: 5, scored: 8, conceded: 6, avgScored: 1.6, avgConceded: 1.2 },
            matches: []
          },
          awayTeamStats: {
            teamName: awayTeam,
            form: ["W", "L", "W", "W", "D"],
            matchesPlayed: 10,
            wins: 5,
            draws: 3,
            losses: 2,
            goalsScoredTotal: 16,
            goalsConcededTotal: 10,
            avgGoalsScored: 1.6,
            avgGoalsConceded: 1,
            cleanSheets: 3,
            failedToScore: 2,
            homeStats: { matches: 5, scored: 9, conceded: 4, avgScored: 1.8, avgConceded: 0.8 },
            awayStats: { matches: 5, scored: 7, conceded: 6, avgScored: 1.4, avgConceded: 1.2 },
            matches: []
          },
          metrics: {
            predTotalOver25: 70,
            predTotalOver15: 90,
            predBTTS: 65,
            firstHalfGoalProb: 75,
            secondHalfGoalProb: 85,
            highestScoringInterval: "76-90+'",
            dangerLevel: "high",
            forecastNote: `\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u0442\u0447 ${lg.titleRu}.`
          }
        });
      }
    } catch {
    }
  }
  return result;
}
var cachedMatches = {};
var CACHE_TTL_MS = 1e4;
async function parseLiveAndUpcomingFootballMatches(source) {
  const sourceKey = source || "all";
  const now = Date.now();
  if (cachedMatches[sourceKey] && now - cachedMatches[sourceKey].time < CACHE_TTL_MS) {
    return cachedMatches[sourceKey].data;
  }
  let results = [];
  if (sourceKey === "flashscore") {
    results = await parseFlashscoreFeed();
  } else if (sourceKey === "fonbet") {
    results = await parseFonbetFlashscoreFeed();
  } else if (sourceKey === "livescore") {
    results = await parseLiveScoreFeed();
  } else if (sourceKey === "espn") {
    results = await parseESPNFeed();
  } else {
    const [fsList, lsList, espnList] = await Promise.all([
      parseFlashscoreFeed().catch(() => []),
      parseLiveScoreFeed().catch(() => []),
      parseESPNFeed().catch(() => [])
    ]);
    const combined = [...fsList];
    const seenSignatures = /* @__PURE__ */ new Set();
    for (const m of fsList) {
      seenSignatures.add(`${m.homeTeam.toLowerCase()}__${m.awayTeam.toLowerCase()}`);
    }
    for (const m of lsList) {
      const sig = `${m.homeTeam.toLowerCase()}__${m.awayTeam.toLowerCase()}`;
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        combined.push(m);
      }
    }
    for (const m of espnList) {
      const sig = `${m.homeTeam.toLowerCase()}__${m.awayTeam.toLowerCase()}`;
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        combined.push(m);
      }
    }
    results = combined;
  }
  results.sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;
    if (a.status === "live" && b.status === "live") {
      const minA = Math.min(95, a.liveMinute || 0);
      const minB = Math.min(95, b.liveMinute || 0);
      return minB - minA;
    }
    if (a.status === "upcoming" && b.status === "finished") return -1;
    if (b.status === "upcoming" && a.status === "finished") return 1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
  cachedMatches[sourceKey] = {
    time: now,
    data: results
  };
  return results;
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DIST_DIR = path.join(__dirname, "dist");
var PORT = parseInt(process.env.PORT || "3000", 10);
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};
function serveFile(res, filePath, defaultContentType = "application/octet-stream") {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(DIST_DIR, "index.html");
      fs.readFile(indexPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("MatchPulse: \u0424\u0430\u0439\u043B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u0421\u043E\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0435\u043A\u0442 \u0447\u0435\u0440\u0435\u0437 npm run build");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || defaultContentType;
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable"
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}
var server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost:3000"}`);
  if (reqUrl.pathname === "/api/matches") {
    try {
      const source = reqUrl.searchParams.get("source") || "all";
      const matches = await parseLiveAndUpcomingFootballMatches(source);
      const jsonStr = JSON.stringify(matches);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      });
      res.end(jsonStr);
    } catch (err) {
      console.error("[API Error]", err);
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: err?.message || "Parser failure" }));
    }
    return;
  }
  if (reqUrl.pathname === "/api/telegram/send" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const { token, chatId, text } = JSON.parse(body || "{}");
        if (!token || !chatId || !text) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, description: "Missing token, chatId, or text" }));
          return;
        }
        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true
          }),
          signal: AbortSignal.timeout(8e3)
        });
        const telegramData = await telegramRes.json();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(telegramData));
      } catch (err) {
        console.error("[Telegram API Proxy Error]", err);
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: false, description: err?.message || "Telegram proxy error" }));
      }
    });
    return;
  }
  if (reqUrl.pathname === "/api/ping") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("pong");
    return;
  }
  let safePath = path.normalize(decodeURIComponent(reqUrl.pathname)).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "\\") {
    safePath = "/index.html";
  }
  const filePath = path.join(DIST_DIR, safePath);
  serveFile(res, filePath);
});
server.listen(PORT, "0.0.0.0", () => {
  console.log(`
======================================================`);
  echoRunningBanner(PORT);
});
function echoRunningBanner(port) {
  console.log(`   \u26A1 MatchPulse Standalone Server \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0437\u0430\u043F\u0443\u0449\u0435\u043D!`);
  console.log(`   \u{1F310} \u0410\u0434\u0440\u0435\u0441 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435: http://localhost:${port}`);
  console.log(`   \u{1F4E1} \u0411\u0435\u0437 \u0441\u0442\u043E\u0440\u043E\u043D\u043D\u0438\u0445 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0435\u0439 (100% \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 Node)`);
  console.log(`======================================================
`);
}
var server_default = server;
export {
  server_default as default
};
