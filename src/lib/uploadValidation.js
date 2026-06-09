export const UPLOAD_LIMITS = {
  maxImages: 80,
  maxImageSizeBytes: 18 * 1024 * 1024,
  maxAudioSizeBytes: 80 * 1024 * 1024,
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedAudioTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav']
};

export function validateImageFiles(files, currentCount = 0) {
  const errors = [];
  const accepted = [];

  for (const file of [...files]) {
    if (!UPLOAD_LIMITS.acceptedImageTypes.includes(file.type)) {
      errors.push(`${file.name}: nieobsługiwany format zdjęcia`);
      continue;
    }

    if (file.size > UPLOAD_LIMITS.maxImageSizeBytes) {
      errors.push(`${file.name}: zdjęcie przekracza ${formatMegabytes(UPLOAD_LIMITS.maxImageSizeBytes)}`);
      continue;
    }

    if (currentCount + accepted.length >= UPLOAD_LIMITS.maxImages) {
      errors.push(`Limit zdjęć w projekcie: ${UPLOAD_LIMITS.maxImages}`);
      break;
    }

    accepted.push(file);
  }

  return { accepted, errors };
}

export function validateAudioFile(file) {
  if (!file) return { accepted: null, errors: ['Nie wybrano pliku audio'] };

  if (!UPLOAD_LIMITS.acceptedAudioTypes.includes(file.type)) {
    return { accepted: null, errors: [`${file.name}: nieobsługiwany format audio`] };
  }

  if (file.size > UPLOAD_LIMITS.maxAudioSizeBytes) {
    return { accepted: null, errors: [`${file.name}: audio przekracza ${formatMegabytes(UPLOAD_LIMITS.maxAudioSizeBytes)}`] };
  }

  return { accepted: file, errors: [] };
}

function formatMegabytes(bytes) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}
