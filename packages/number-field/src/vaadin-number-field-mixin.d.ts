/**
 * @license
 * Copyright (c) 2021 - 2023 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */
import type { Constructor } from '@open-wc/dedupe-mixin';
import type { ControllerMixinClass } from '@vaadin/component-base/src/controller-mixin.js';
import type { DelegateFocusMixinClass } from '@vaadin/component-base/src/delegate-focus-mixin.js';
import type { DelegateStateMixinClass } from '@vaadin/component-base/src/delegate-state-mixin.js';
import type { DisabledMixinClass } from '@vaadin/component-base/src/disabled-mixin.js';
import type { FocusMixinClass } from '@vaadin/component-base/src/focus-mixin.js';
import type { KeyboardMixinClass } from '@vaadin/component-base/src/keyboard-mixin.js';
import type { FieldMixinClass } from '@vaadin/field-base/src/field-mixin.js';
import type { InputConstraintsMixinClass } from '@vaadin/field-base/src/input-constraints-mixin.js';
import type { InputControlMixinClass } from '@vaadin/field-base/src/input-control-mixin.js';
import type { InputFieldMixinClass } from '@vaadin/field-base/src/input-field-mixin.js';
import type { InputMixinClass } from '@vaadin/field-base/src/input-mixin.js';
import type { LabelMixinClass } from '@vaadin/field-base/src/label-mixin.js';
import type { SlotStylesMixinClass } from '@vaadin/field-base/src/slot-styles-mixin.js';
import type { ValidateMixinClass } from '@vaadin/field-base/src/validate-mixin.js';

/**
 * A mixin providing common number field functionality.
 */
export declare function NumberFieldMixin<T extends Constructor<HTMLElement>>(
  base: T,
): Constructor<ControllerMixinClass> &
  Constructor<DelegateFocusMixinClass> &
  Constructor<DelegateStateMixinClass> &
  Constructor<DisabledMixinClass> &
  Constructor<FieldMixinClass> &
  Constructor<FocusMixinClass> &
  Constructor<InputConstraintsMixinClass> &
  Constructor<InputControlMixinClass> &
  Constructor<InputFieldMixinClass> &
  Constructor<InputMixinClass> &
  Constructor<KeyboardMixinClass> &
  Constructor<LabelMixinClass> &
  Constructor<NumberFieldMixinClass> &
  Constructor<SlotStylesMixinClass> &
  Constructor<ValidateMixinClass> &
  T;

export declare class NumberFieldMixinClass {
  /**
   * The minimum value of the field.
   */
  min: number | null | undefined;

  /**
   * The maximum value of the field.
   */
  max: number | null | undefined;

  /**
   * Specifies the allowed number intervals of the field.
   */
  step: number;

  /**
   * Set to true to show increase/decrease buttons.
   * @attr {boolean} step-buttons-visible
   */
  stepButtonsVisible: boolean;
}
