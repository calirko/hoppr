-- AnyDesk IDs were being saved with spaces (e.g. "1009 891 864"), which produces an
-- invalid anydesk:// URI at launch time. Strip all whitespace from stored hosts.
UPDATE "Connection"
SET "host" = REGEXP_REPLACE("host", '\s+', '', 'g')
WHERE "host" ~ '\s';
