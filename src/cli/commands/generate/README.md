<!-- LINK_MD: ID: generate-command -->
<!-- LINK_MD: LOCK: true -->

# GENERATE COMMAND

- link-md generate
- lnmd generate

## Set Config in md File

### ROOT FILE

```markdown
<!-- LINK_MD: CONFIG:
skip-hidden: true # optional: default true (ex: ignore .git, .idea, etc)
include: src/**/*,libs/**/*.ts # optional: default empty (all files)
exclude: dist/**/* # optional: default empty (only node_modules)
filenames: README.md,CHANGE_LOG.md # optional: default README.md
output: README_MAIN.md # optional: README.md
-->
```

### OTHERS

#### child file setting

_set file id and link name_

```markdown
<!-- LINK_MD: ID: hoge -->
<!-- LINK_MD: LOCK: true --> # not generate when it true, default false
<!-- LINK_MD: TITLE: GENERATE COMMAND -->
```

or

```markdown
<!-- LINK_MD: ID: hoge -->

# GENERATE COMMAND
```

_set specific target md position_

```markdown
<!-- LINK_MD: LINK_NEXT_LINE:
id: hoge # required
inline: false  # optional: default false
-->
```

_all / children / grandChild / parallel depth link list_

```markdown
<!-- LINK_MD: BEGIN_LINKS:
all: true # optional: default false
linked: false # optional: default false
child: true # optional: default false
grandChild: true # optional: default false
parallel: true # optional: default false
-->

<!-- LINK_MD: END_LINKS: -->
```

## Command Options

```js
  .option('-sh --skip-hidden <boolean>', 'skip read hidden dir, default: true')
  .option('-incl, --include <strings>', 'include dirs, default: [] (all files)')
  .option('-excl, --exclude <strings>', 'ignore dirs, default: node_modules only')
  .option('-f, --filenames <strings>', 'filenames, default: README.md only')
  .option('-o, --output <filename>', 'output filename. default: README.md (replace)')
  .option('-i, --input <filename>', 'target root filename, default: README.md')
```

<!-- LINK_MD: BEGIN_DEFINE_LINKS: -->

<!-- LINK_MD: END_DEFINE_LINKS: -->
