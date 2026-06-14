const PHONE_PATTERN = /^(\+243\d{9}|243\d{9}|0\d{9})$/;

export function getAvailableTypesForCategory(types, categoryId) {
  if (!categoryId) {
    return [];
  }

  return types.filter((type) => {
    const typeCategoryId = type.category?.id ?? type.category_id;
    return String(typeCategoryId) === String(categoryId);
  });
}

export function validatePhoneNumber(value) {
  const phone = String(value ?? "").trim();

  if (!phone) {
    return null;
  }

  if (!PHONE_PATTERN.test(phone)) {
    return "Le numéro doit être au format +243XXXXXXXXX, 243XXXXXXXXX ou 0XXXXXXXXX.";
  }

  return null;
}

export function normalizePhoneNumber(value) {
  const phone = String(value ?? "").trim();

  if (!phone) {
    return null;
  }

  const digits = phone.startsWith("+") ? phone.slice(1) : phone;

  if (digits.startsWith("0")) {
    return `+243${digits.slice(1)}`;
  }

  if (digits.startsWith("243")) {
    return `+243${digits.slice(3)}`;
  }

  return `+243${digits}`;
}
