/**

  Render a day table of talks as HTML

*/

class AgendaDayTemplate {

  constructor(model) {
    this.model = model;
    //console.log(model);
  }

  render() {
    const model = this.model;
    return (
`
<h1 class="kday-title">${model.name}</h1>
<table class="kagenda-table">
<thead class="kagenda-head"><tr>${this.renderColLabels()}</tr></thead>
<tbody>${this.renderBody()}</tbody>
</table>
`
    );
  }

  renderColLabels() {
    const labels = [''].concat(this.model.colLabels);
    return labels.map((label) => {
      return `<th class="kagenda-table-th">${label}</th>`
    }).join('')
  }

  renderBody() {
    const rowLabels = this.model.rowLabels;
    return (
      rowLabels.map(({ start, end }, rowIndex) => {
        const row = this.model.data[rowIndex];
        // TODO render time metadata. Hell, render all scema metadata, right?
        return (
`
<tr class="kagenda-table-tr">
<td class="kagenda-table-th">${start}-${end}</td>
${!row? '' : row.map((cell) => !cell? '' : this.renderCell(cell)).join('')}
</tr>
`
        )
      }).join('')
    )
  }

  renderCell({ start, end, type, contents, rowSpan, colSpan }) {
    var $contents =
      type === 'TALK'? this.renderTalk(contents) :
      type === 'BREAK'? contents.title :
      'Empty slot';


    return contents.type === 'EXTEND'? '' :
      ` <td class="kagenda-table-td ${type && type.toLowerCase() || ''}" rowspan="${rowSpan}" colspan="${colSpan}"> ${$contents} </td> `;
  }

  renderTalk({ id, hash, title, description, authors, tags }) {
    return (
`
<a href="#${hash}" data-id="${id}" data-hash="${hash}" class="kagenda-talk-title">${title}</a>
<p>${authors.map((a) => this.renderAuthor(a)).join(', ')}</p>
`
    )
  }

  renderAuthor({ id, uuid, name, avatar, description}) {
    return (
`
${name}
`
    )
  }

};

export { AgendaDayTemplate }
