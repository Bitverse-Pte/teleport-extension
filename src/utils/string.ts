/**
 * copy from stackoverflow
 * https://stackoverflow.com/a/59084440
 */
export function parseStringTemplate(str: string, obj: Record<string, string>) {
  const parts = str.split(/\$\{(?!\d)[\wæøåÆØÅ]*\}/);
  // eslint-disable-next-line
  const args = str.match(/[^{\}]+(?=})/g) || [];
  const parameters = args.map(
    (argument) =>
      obj[argument] || (obj[argument] === undefined ? '' : obj[argument])
  );
  return String.raw({ raw: parts }, ...parameters);
}
