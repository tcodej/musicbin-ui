import { Fragment } from 'react';

export default function Breadcrumbs({ path, loadList }) {

  const getBreadcrumbs = () => {
    const parts = path.split('/');
    let back = '';
    const folder = <div className="folder">{parts.pop()}</div>;

    if (parts.length > 0) {
      back = <div className="back" onClick={() => loadList(parts.join('/'))}>Back</div>;
    }

    return [back, folder];
  }

  return (
    <div id="breadcrumbs">
      { getBreadcrumbs().map((item, index) => {
        return <Fragment key={item+index}>{item}</Fragment>
      }) }
    </div>
  );
}
