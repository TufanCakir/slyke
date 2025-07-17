import React from "react";
import { View, Text } from "react-native";
import Calculator from "./Calculator";
export default function Preview() {
  return (
    <View>
<Text>{`Hallo, ich bin Slyke!`}</Text>
    <Text>{`${" echo ist eine neu möcklichkeit für destruction text in template strings und backticks"}`}</Text>
    <Text>wiso so was kann das ganz einfach</Text>
    <Text>es ermöglich euch voll dynamisch zu sein was texte betrifff</Text>
    <Text>ich kann so Hallo ich bin {name} und bin {age} jahre alt</Text>
    <Text>name und age sind variablen</Text>
    <Text>Herzlich Willkommen auf meiner Seite.</Text>
    <Text>wollt ihr sehen was ich</Text>
    <Text>kann ich zeig es euch ich render ein Calculator für euch</Text>
    <Calculator />
    </View>
  );
}