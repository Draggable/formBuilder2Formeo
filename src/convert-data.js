import uuid from "uuid";
import set from "lodash/set";
import startCase from "lodash/startCase";
import parseXML from "./xml-parser";

const IGNORED_PROPS = ["style", "subtype", "role", "access", "toggle", "other"];

// Add mappings here
const propMap = {
  label: "config.label",
  values: "options",
  type: "meta.id",
  description: "config.helpText",
  tag: "tag",
  attrs: "attrs",
  options: "options",
  meta: "meta",
  icon: "meta.icon"
};

// define all the types that are `input` types
const inputTags = [
  "autocomplete",
  "checkbox-group",
  "date",
  "file",
  "hidden",
  "number",
  "radio-group",
  "text"
];

const tagMap = {
  ...inputTags.reduce((acc, cur) => {
    acc[cur] = "input";
    return acc;
  }, {}),
  "textarea-tinymce": "div"
};

const htmlElements = [
  ...Array.from(Array(5).keys())
    .slice(1)
    .map(key => `h${key}`),
  "p",
  "blockquote",
  "canvas",
  "output"
];

const typeModifiers = {
  "checkbox-group": fieldData => {
    fieldData.values = fieldData.values.map(option => ({
      label: option.label,
      value: option.value,
      checked: Boolean(option.selected)
    }));
    // in formBuilder, `other` property would enable a user to add their own value
    // in formeo any checkbox can be made an `other` field so we add Other to `options`
    if (fieldData.other) {
      fieldData.values.push({ label: "Other", value: "", editable: true });
    }
    return fieldData;
  },
  header: fieldData => {
    const { subtype = "h1", ...rest } = fieldData;
    rest.tag = subtype;
    rest.attrs = {
      tag: ["h1", "h2", "h3", "h4"].map(tag => ({
        label: tag.toUpperCase(),
        value: tag,
        selected: tag === subtype
      }))
    };
    return rest;
  },
  button: fieldData => {
    const { subtype = "button", ...rest } = fieldData;
    rest.tag = "button";
    rest.options = [{
      label: startCase(subtype),
      value: rest.value,
      type: subtype,
      className: rest.className
    }];
    return rest;
  }
};

const formeoRow = ({ id }) => ({
  id: uuid(),
  config: {
    fieldset: false,
    legend: "",
    inputGroup: false
  },
  attrs: {
    className: "f-row"
  },
  children: [id]
});

const formeoColumn = ({ id }) => ({ id: uuid(), children: [id] });

const formeoField = fieldData => {
  const { type, subtype } = fieldData;
  const metaId = Array.from(new Set([type, subtype]))
    .filter(Boolean)
    .join(".");

  // set a tag for the field, usually its `input`
  set(fieldData, "tag", tagMap[metaId] || subtype || type);
  fieldData.icon = metaId;

  // sometimes we need to change the structure rather than just remapping props
  if (typeModifiers[type]) {
    fieldData = typeModifiers[type](fieldData);
  }

  const modifiedFieldData = Object.entries(fieldData).reduce(
    (acc, [key, val]) => {
      if (!IGNORED_PROPS.includes(key)) {
        const newPath = propMap[key];
        if (Array.isArray(newPath)) {
          newPath.forEach(path => {
            set(acc, path || key, val);
          });
        } else {
          set(acc, newPath || `attrs.${key}`, val);
        }
      }

      return acc;
    },
    {}
  );

  // group is mainly used for contol definitions, this may not be needed.
  modifiedFieldData.meta.group = htmlElements.includes(modifiedFieldData.tag)
    ? "html"
    : "form";

  return {
    id: uuid(),
    ...modifiedFieldData
  };
};

const formatter = {
  fields: formeoField,
  columns: formeoColumn,
  rows: formeoRow
};

const dataReducer = (values, format = "fields") =>
  values.reduce((acc, cur) => {
    const elem = formatter[format](cur);
    acc[elem.id] = elem;
    return acc;
  }, {});

const formeoStage = rowIds => {
  const stageId = uuid();
  return {
    [stageId]: {
      id: stageId,
      settings: {},
      children: rowIds
    }
  };
};

export default function convertData(data = "[]") {
  if (/^<form-template>/.test(data)) {
    data = JSON.stringify(parseXML(data));
  }
  const fields = dataReducer(JSON.parse(data));
  const columns = dataReducer(Object.values(fields), "columns");
  const rows = dataReducer(Object.values(columns), "rows");

  const formeoData = {
    id: uuid(),
    fields,
    columns,
    rows,
    stages: formeoStage(Object.keys(rows))
  };
  return formeoData;
}
