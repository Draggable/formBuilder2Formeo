/**
 * Convert html element attributes to key/value object
 * @param  {Object} elem DOM element
 * @return {Object} ex: {attrName: attrValue}
 */
const parseAttrs = elem => {
  let attrs = elem.attributes || [];
  let data = {};
  for (let i = 0; i < attrs.length; i++) {
    let attrVal = attrs[i].value || "";
    if (attrVal.match(/false|true/g)) {
      attrVal = attrVal === "true";
    } else if (attrVal.match(/undefined/g)) {
      attrVal = undefined;
    }

    if (attrVal) {
      data[attrs[i].name] = attrVal;
    }
  }

  return data;
};

/**
 * Convert field options to optionData
 * @param  {NodeList} options  DOM elements
 * @return {Array} optionData array
 */
const parseOptions = options => {
  let data = [];

  for (let i = 0; i < options.length; i++) {
    const optionData = parseAttrs(options[i]) || {};
    optionData.label = options[i].textContent;
    data.push(optionData);
  }

  return data;
};

/**
 * Parse XML formData
 * @param  {String} xmlString
 * @return {Array}            formData array
 */
const parseXML = xmlString => {
  const parser = new window.DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");
  const formData = [];

  if (xml) {
    const fields = xml.getElementsByTagName("field");

    for (let i = 0; i < fields.length; i++) {
      const fieldData = parseAttrs(fields[i]);
      const options = fields[i].getElementsByTagName("option");

      if (options && options.length) {
        fieldData.values = parseOptions(options);
      }

      formData.push(fieldData);
    }
  }

  return formData;
};

export default parseXML;
