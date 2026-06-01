import { ClassicEditor } from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Link,
  List,
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageStyle,
  ImageResizeButtons,
  ImageCaption,
  FileRepository,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  MediaEmbed,
  Alignment,
} from "ckeditor5";
import koTranslations from "ckeditor5/translations/ko.js";

export default class MinSeokEditor extends ClassicEditor {}

MinSeokEditor.builtinPlugins = [
  Alignment,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Link,
  List,
  Image,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageResizeButtons,
  ImageStyle,
  ImageCaption,
  FileRepository,
  Table,
  TableToolbar,
  MediaEmbed
];

MinSeokEditor.defaultConfig = {
  licenseKey: "GPL",
  language: "ko",
  translations: [koTranslations],
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "alignment",
    "bulletedList",
    "numberedList",
    "|",
    "insertTable",
    "imageUpload",
    "mediaEmbed",
    "|",
    "undo",
    "redo",
  ],
  image: {
    resizeUnit: "%",
    toolbar: [
      "resizeImage:original",
      "resizeImage:50",
      "resizeImage:75",
      "|",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
    ],
  },
  mediaEmbed: {
    previewsInData: true,
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
  },
};

