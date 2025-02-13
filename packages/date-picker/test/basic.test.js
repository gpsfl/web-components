import { expect } from '@esm-bundle/chai';
import { click, fixtureSync, keyboardEventFor, oneEvent, tap } from '@vaadin/testing-helpers';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import '../src/vaadin-date-picker.js';
import { parseDate } from '../src/vaadin-date-picker-helper.js';
import { close, open, touchTap, waitForOverlayRender } from './helpers.js';

describe('basic features', () => {
  let datepicker, input;

  beforeEach(() => {
    datepicker = fixtureSync(`<vaadin-date-picker></vaadin-date-picker>`);
    input = datepicker.inputElement;
  });

  it('should parse date components with varying number of digits', () => {
    const composeDate = (year, month, day) => {
      const date = new Date(0, 0);
      date.setFullYear(parseInt(year));
      date.setMonth(parseInt(month));
      date.setDate(parseInt(day));
      return date;
    };

    expect(parseDate('2017-11-11')).to.eql(composeDate('2017', '10', '11'));
    expect(parseDate('2016-1-1')).to.eql(composeDate('2016', '0', '1'));
    expect(parseDate('04-11-2')).to.eql(composeDate('04', '10', '2'));
  });

  it('should have default value', () => {
    expect(datepicker.value).to.equal('');
  });

  it('should notify value change', () => {
    const spy = sinon.spy();
    datepicker.addEventListener('value-changed', spy);
    datepicker.value = '2000-02-01';
    expect(spy.calledOnce).to.be.true;
  });

  it('should keep focused attribute when focus moves to overlay', async () => {
    datepicker.focus();
    await sendKeys({ press: 'ArrowDown' });
    await waitForOverlayRender();
    expect(datepicker.hasAttribute('focused')).to.be.true;
  });

  it('should have focused attribute when closed and focused', async () => {
    datepicker.focus();
    await sendKeys({ press: 'ArrowDown' });
    await waitForOverlayRender();
    await sendKeys({ press: 'Escape' });
    expect(datepicker.hasAttribute('focused')).to.be.true;
  });

  it('should notify opened changed on open and close', async () => {
    const spy = sinon.spy();
    datepicker.addEventListener('opened-changed', spy);
    await open(datepicker);
    expect(spy.calledOnce).to.be.true;
    await close(datepicker);
    expect(spy.calledTwice).to.be.true;
  });

  it('should set opened to false with close call', async () => {
    await open(datepicker);
    await close(datepicker);
    expect(datepicker.opened).to.be.false;
  });

  it('should open on input tap', async () => {
    tap(input);
    await oneEvent(datepicker.$.overlay, 'vaadin-overlay-open');
  });

  it('should focus the input on touch tap', () => {
    touchTap(input);
    expect(document.activeElement).to.equal(input);
  });

  it('should open on input container element click', () => {
    const inputField = datepicker.shadowRoot.querySelector('[part="input-field"]');
    click(inputField);
    expect(datepicker.opened).to.be.true;
  });

  it('should prevent default for the handled click event', () => {
    const inputField = datepicker.shadowRoot.querySelector('[part="input-field"]');
    const event = click(inputField);
    expect(event.defaultPrevented).to.be.true;
  });

  it('should not prevent default for click when autoOpenDisabled', () => {
    datepicker.autoOpenDisabled = true;
    const inputField = datepicker.shadowRoot.querySelector('[part="input-field"]');
    const event = click(inputField);
    expect(event.defaultPrevented).to.be.false;
  });

  it('should lead zeros correctly', () => {
    datepicker.value = '+000300-02-01';
    expect(input.value).to.equal('2/1/0300');
  });

  it('should format display correctly', () => {
    datepicker.value = '2000-02-01';
    expect(input.value).to.equal('2/1/2000');
    datepicker.value = '1999-12-31';
    expect(input.value).to.equal('12/31/1999');
  });

  it('should format display correctly with sub 100 years', () => {
    datepicker.value = '+000001-02-01';
    expect(input.value).to.equal('2/1/0001');
    datepicker.value = '+000099-02-01';
    expect(input.value).to.equal('2/1/0099');
  });

  it('should not change datepicker width', async () => {
    datepicker.style.display = 'inline-block';

    datepicker.value = '2000-01-01';
    const width = datepicker.clientWidth;

    await open(datepicker);
    expect(datepicker.clientWidth).to.equal(width);
  });

  describe('value property formats', () => {
    it('should accept ISO format', () => {
      const date = new Date(0, 1, 3);

      datepicker.value = '0000-02-03';
      date.setFullYear(0);
      expect(datepicker._selectedDate).to.eql(date);

      datepicker.value = '+010000-02-03';
      date.setFullYear(10000);
      expect(datepicker._selectedDate).to.eql(date);

      datepicker.value = '-010000-02-03';
      date.setFullYear(-10000);
      expect(datepicker._selectedDate).to.eql(date);
    });

    it('should not accept non-ISO formats', () => {
      datepicker.value = '03/02/01';
      expect(datepicker.value).to.equal('');
      expect(datepicker._selectedDate).to.be.null;

      datepicker.value = '2010/02/03';
      expect(datepicker.value).to.equal('');
      expect(datepicker._selectedDate).to.be.null;

      datepicker.value = '03/02/2010';
      expect(datepicker.value).to.equal('');
      expect(datepicker._selectedDate).to.be.null;

      datepicker.value = '3 Feb 2010';
      expect(datepicker.value).to.equal('');
      expect(datepicker._selectedDate).to.be.null;

      datepicker.value = 'Feb 3, 2010';
      expect(datepicker.value).to.equal('');
      expect(datepicker._selectedDate).to.be.null;
    });

    it('should output ISO format', () => {
      const date = new Date(0, 1, 3);

      date.setFullYear(0);
      datepicker._selectedDate = date;
      expect(datepicker.value).to.equal('0000-02-03');

      date.setFullYear(10000);
      datepicker._selectedDate = new Date(date.getTime());
      expect(datepicker.value).to.equal('+010000-02-03');

      date.setFullYear(-10000);
      datepicker._selectedDate = new Date(date.getTime());
      expect(datepicker.value).to.equal('-010000-02-03');
    });
  });

  describe('i18n', () => {
    let overlayContent;

    beforeEach(async () => {
      datepicker.i18n = {
        ...datepicker.i18n,
        weekdays: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
        weekdaysShort: ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'],
        firstDayOfWeek: 1,
        today: 'Tänään',
        cancel: 'Peruuta',
        formatDate: (d) => {
          if (d) {
            return [d.day, d.month + 1, d.year].join('.');
          }
        },
      };

      await open(datepicker);
      overlayContent = datepicker._overlayContent;
    });

    it('should notify i18n mutation to children', () => {
      const monthCalendar = overlayContent.querySelector('vaadin-month-calendar');
      const weekdays = monthCalendar.$.monthGrid.querySelectorAll('[part="weekday"]:not(:empty)');
      const weekdayTitles = Array.prototype.map.call(weekdays, (weekday) => weekday.textContent.trim());
      expect(weekdayTitles).to.eql(['ma', 'ti', 'ke', 'to', 'pe', 'la', 'su']);
    });

    it('should reflect value in overlay header', () => {
      datepicker.value = '2000-02-01';
      expect(overlayContent.shadowRoot.querySelector('[part="label"]').textContent.trim()).to.equal('1.2.2000');
    });

    it('should display buttons in correct locale', () => {
      expect(overlayContent._todayButton.textContent.trim()).to.equal('Tänään');
      expect(overlayContent._cancelButton.textContent.trim()).to.equal('Peruuta');
    });
  });

  describe('autoselect', () => {
    it('should set autoselect to false by default', () => {
      expect(datepicker.autoselect).to.be.false;
    });

    it('should not select content on focus when autoselect is false', () => {
      const spy = sinon.spy(input, 'select');
      datepicker.value = '2016-07-14';
      input.focus();
      expect(spy.called).to.be.false;
    });

    it('should select content on focus when autoselect is true', () => {
      const spy = sinon.spy(input, 'select');
      datepicker.value = '2016-07-14';
      datepicker.autoselect = true;
      input.focus();
      expect(spy.calledOnce).to.be.true;
    });
  });
});

describe('inside flexbox', () => {
  it('date-picker should stretch to fit the column flex container', () => {
    const container = fixtureSync(`
    <div style="display: flex; flex-direction: column; width: 500px;">
      <vaadin-date-picker></vaadin-date-picker>
    </div>
    `);
    const flexDatePicker = container.querySelector('vaadin-date-picker');
    expect(window.getComputedStyle(container).width).to.eql('500px');
    expect(window.getComputedStyle(flexDatePicker).width).to.eql('500px');
  });
});

describe('clear button', () => {
  let datepicker, clearButton;

  beforeEach(() => {
    datepicker = fixtureSync('<vaadin-date-picker clear-button-visible></vaadin-date-picker>');
    clearButton = datepicker.shadowRoot.querySelector('[part="clear-button"]');
  });

  it('should have clearButtonVisible property', () => {
    expect(datepicker).to.have.property('clearButtonVisible', true);
  });

  it('should clear the value on click', () => {
    datepicker.value = '2000-02-01';
    click(clearButton);
    expect(datepicker.value).to.equal('');
  });

  it('should clear the value on touch tap', () => {
    datepicker.value = '2000-02-01';
    touchTap(clearButton);
    expect(datepicker.value).to.equal('');
  });

  it('should remove has-value attribute on clear', () => {
    datepicker.value = '2000-02-01';
    click(clearButton);
    expect(datepicker.hasAttribute('has-value')).to.be.false;
  });

  it('should prevent default on clear button click event', () => {
    datepicker.value = '2000-02-01';
    const event = click(clearButton);
    expect(event.defaultPrevented).to.be.true;
  });

  it('should prevent default on Esc when clearing value', () => {
    datepicker.value = '2000-02-01';
    const event = keyboardEventFor('keydown', 27, [], 'Escape');
    datepicker.inputElement.dispatchEvent(event);
    expect(event.defaultPrevented).to.be.true;
  });

  it('should stop propagation on Esc when clearing value', () => {
    datepicker.value = '2000-02-01';
    const event = keyboardEventFor('keydown', 27, [], 'Escape');
    const spy = sinon.spy(event, 'stopPropagation');
    datepicker.inputElement.dispatchEvent(event);
    expect(spy.calledOnce).to.be.true;
  });

  it('should not stop propagation on Esc when no value is set', () => {
    const event = keyboardEventFor('keydown', 27, [], 'Escape');
    const spy = sinon.spy(event, 'stopPropagation');
    datepicker.inputElement.dispatchEvent(event);
    expect(spy.called).to.be.false;
  });

  it('should not stop propagation on Esc when clearButtonVisible is false', () => {
    datepicker.clearButtonVisible = false;
    const event = keyboardEventFor('keydown', 27, [], 'Escape');
    const spy = sinon.spy(event, 'stopPropagation');
    datepicker.inputElement.dispatchEvent(event);
    expect(spy.called).to.be.false;
  });

  it('should not close on clear button click when opened', async () => {
    await open(datepicker);
    datepicker.value = '2001-01-01';
    click(clearButton);
    expect(datepicker.opened).to.be.true;
  });

  it('should not open on clear button click when not opened', () => {
    datepicker.value = '2001-01-01';
    click(clearButton);
    expect(datepicker.opened).to.be.not.ok;
  });
});

describe('wrapped', () => {
  let container, datepicker;

  beforeEach(() => {
    container = fixtureSync(`
      <div style="height: 100px; overflow: scroll;">
        <div style="height: 1000px;">
          <vaadin-date-picker></vaadin-date-picker>
        </div>
      </div>
    `);
    datepicker = container.querySelector('vaadin-date-picker');
  });

  it('should match the parent width', () => {
    container.querySelector('div').style.width = '120px';
    datepicker.style.width = '100%';
    expect(datepicker.clientWidth).to.equal(120);
  });
});

describe('initial value attribute', () => {
  let datepicker, input;

  beforeEach(() => {
    datepicker = fixtureSync('<vaadin-date-picker value="2000-01-01"></vaadin-date-picker>');
    input = datepicker.inputElement;
  });

  it('should format the input value', () => {
    expect(input.value).to.equal('1/1/2000');
  });
});

describe('auto open disabled', () => {
  let datepicker, input, toggleButton;

  beforeEach(() => {
    datepicker = fixtureSync('<vaadin-date-picker value="2000-01-01"></vaadin-date-picker>');
    input = datepicker.inputElement;
    toggleButton = datepicker.shadowRoot.querySelector('[part="toggle-button"]');
    datepicker.autoOpenDisabled = true;
  });

  it('should focus the input on touch tap', () => {
    touchTap(input);
    expect(document.activeElement).to.equal(input);
  });

  it('should not blur the input on open', async () => {
    touchTap(input);
    await open(datepicker);
    expect(document.activeElement).to.equal(input);
  });

  it('should not open on input tap', () => {
    tap(input);
    expect(datepicker.opened).not.to.be.true;
  });

  it('should open on calendar icon tap', async () => {
    tap(toggleButton);
    await oneEvent(datepicker.$.overlay, 'vaadin-overlay-open');
  });
});

describe('ios', () => {
  let datepicker, input;

  beforeEach(() => {
    datepicker = fixtureSync('<vaadin-date-picker value="2000-01-01"></vaadin-date-picker>');
    input = datepicker.inputElement;
    datepicker._ios = true;
  });

  it('should focus the input when closed', () => {
    datepicker.focus();
    expect(document.activeElement).to.equal(input);
  });

  it('should blur the input when opened', async () => {
    datepicker.focus();
    await open(datepicker);
    expect(document.activeElement).to.not.equal(input);
  });

  describe('auto open disabled', () => {
    beforeEach(() => {
      datepicker.autoOpenDisabled = true;
    });

    it('should focus the input on touch tap', () => {
      touchTap(input);
      expect(document.activeElement).to.equal(input);
    });

    it('should blur the input on open', async () => {
      touchTap(input);
      await open(datepicker);
      expect(document.activeElement).to.not.equal(input);
    });

    it('should not open on input tap', () => {
      tap(input);
      expect(datepicker.opened).not.to.be.true;
    });
  });
});

describe('required', () => {
  let datePicker;

  beforeEach(() => {
    datePicker = fixtureSync(`<vaadin-date-picker required></vaadin-date-picker>`);
  });

  it('should focus on required indicator click', () => {
    datePicker.shadowRoot.querySelector('[part="required-indicator"]').click();
    expect(datePicker.hasAttribute('focused')).to.be.true;
  });
});
