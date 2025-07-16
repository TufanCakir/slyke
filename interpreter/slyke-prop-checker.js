// slyke-prop-checker.js

const slykeComponent = `
<FastScreen
  label="test"
  native={true}
  screen={true}
  fast={true}
  icon={color: black, size: 50}
  useDrive={true}
  name="Home">
  <Text>Welcome to FastScreen!</Text>
  <Button id="goGame">Go to Game</Button>
</FastScreen>
`;

function parseComponent(componentStr) {
  // Tag suchen (egal wo im String)
  const tagMatch = componentStr.match(/<([A-Za-z0-9_]+)/);
  if (!tagMatch) {
    console.log("No component tag found!");
    return;
  }
  const tagName = tagMatch[1]; // z.B. FastScreen

  // Hole alle Props im Tag
  const propRegex = /([a-zA-Z0-9_]+)=/g;
  let propMatch;
  let props = [];
  while ((propMatch = propRegex.exec(componentStr))) {
    props.push(propMatch[1]);
  }

  // Bestimme verbotenen Basisnamen
  // FastScreen → fast, Native → native, Screen → screen
  const forbidden = tagName.replace(/Screen$/, "").toLowerCase();

  // Checke Props auf Kollision
  props.forEach((prop) => {
    if (prop.toLowerCase() === forbidden && forbidden !== "") {
      throw new Error(
        `❌ Prop name '${prop}' not allowed on <${tagName}>! (Kollision mit Komponentennamen)`
      );
    }
  });

  console.log(`✔️  <${tagName}> Props sind gültig:`, props);
}

// Test
try {
  parseComponent(slykeComponent);
} catch (err) {
  console.error(err.message);
}
