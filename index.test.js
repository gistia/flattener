const { unflatten, flatten } = require('./index');
const expect = require('chai').expect;

describe('unflatten', () => {
  let obj;

  beforeEach(() => {
    const data = {
      name: 'Felipe',
      'config.type': 'patient',
      'config.id': 1,
      'config.items.0.name': 'item',
      'config.items.0.pos': 1,
      'config.items.1.name': 'item2',
      'config.items.1.pos': 2,
    };

    obj = unflatten(data);
  });

  it('unflattens values', () => {
    expect(obj.name).to.eql('Felipe');
  });

  it('unflattens objects', () => {
    expect(obj.config.type).to.eql('patient');
  });

  it('unflattens arrays', () => {
    expect(obj.config.items.length).to.eql(2);
    expect(obj.config.items[1].name).to.eql('item2');
  });
});

describe('flatten', () => {
  let flat;

  beforeEach(() => {
    const data = {
      name: 'Felipe',
      config: {
        type: 'patient',
        id: 1,
        items: [
          { name: 'item', pos: 1}, { name: 'item', pos: 2 },
        ],
      },
      items: [
        { type: 'checkin', date: '2015-01-01', finished: true },
        { type: 'checkout', date: '2015-02-01', finished: true },
      ],
    };

    flat = flatten(data);
  });

  it('flattens values', () => {
    expect(flat.name).to.eql('Felipe');
  });

  it('flattens objects', () => {
    expect(flat['config.type']).to.eql('patient');
  });

  it('flattens arrays', () => {
    expect(flat['config.items.1.pos']).to.eql(2);
    expect(flat['items.1.date']).to.eql('2015-02-01');
  });
});

