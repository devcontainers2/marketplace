#!/usr/bin/env -S deno run -A
import * as CSV from "npm:csv/sync";
import { readFile, rm, writeFile } from "node:fs/promises";
import { $ } from "npm:execa";
import { temporaryDirectoryTask } from "npm:tempy";
import { join } from "node:path";

const $json = (...a) => $(...a).then((r) => JSON.parse(r.stdout));

const text = await readFile("./_data/things.csv", "utf8");
const things = CSV.parse(text, {
  columns: true,
  skip_empty_lines: true,
  cast: true,
});

const features = [];
const templates = [];

console.log("things.length", things.length);
for (const thing of things) {
  console.log("processing", thing);
  let manifest;
  try {
    manifest = await $json`oras manifest fetch ${thing.specifier}:latest`;
  } catch (error) {
    console.log("error fetching manifest. skipping.", thing, error);
    continue;
  }

  if (
    manifest.annotations?.["com.github.package.type"] ===
    "devcontainer_collection"
  ) {
    await $`oras pull ${thing.specifier}:latest -o /tmp/marketplace`;
    const collection = JSON.parse(
      await readFile("/tmp/marketplace/devcontainer-collection.json"),
    );
    await rm("/tmp/marketplace", { force: true, recursive: true });

    for (const feature of collection.features || []) {
      features.push({
        specifier: `${thing.specifier}/${feature.id}`,
        documentationURL: feature.documentationURL,
        source: "",
        author: "",
        stars: "",
        downloads: "",
        name: feature.name || "",
        description: feature.description,
        version: feature.version,
      });
    }
    for (const template of collection.templates || []) {
      let downloads;
      templates.push({
        specifier: `${thing.specifier}/${template.id}`,
        documentationURL: template.documentationURL,
        source: "",
        author: "",
        stars: "",
        downloads: "",
        name: template.name || "",
        description: template.description,
        version: template.version,
      });
    }
  } else if (
    manifest.annotations?.["com.github.package.type"] === "devcontainer_feature"
  ) {
    const feature = JSON.parse(manifest.annotations["dev.containers.metadata"]);
    features.push({
      specifier: thing.specifier,
      documentationURL: feature.documentationURL,
      source: "",
      author: "",
      stars: "",
      downloads: downloads || "",
      name: feature.name || "",
      description: feature.description,
      version: feature.version,
    });
  } else if (
    manifest.annotations?.["com.github.package.type"] ===
    "devcontainer_template"
  ) {
    const template = JSON.parse(
      manifest.annotations["dev.containers.metadata"],
    );
    templates.push({
      specifier: thing.specifier,
      documentationURL: template.documentationURL,
      source: "",
      author: "",
      stars: "",
      downloads: downloads || "",
      name: template.name || "",
      description: template.description,
      version: template.version,
    });
  } else {
    console.log("no manifest annotations. skipping.", thing, manifest);
    continue;
  }
}

{
  console.log("features.length", features.length);
  const text = CSV.stringify(features, {
    header: true,
  });
  await writeFile("_data/features.csv", text);
}
{
  console.log("templates.length", templates.length);
  const text = CSV.stringify(templates, {
    header: true,
  });
  await writeFile("_data/templates.csv", text);
}
