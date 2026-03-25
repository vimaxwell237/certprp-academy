import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_WATCH_PREFERENCES,
  normalizeWatchPreferences,
  shouldNotifyWatcher
} from "@/features/operations/lib/watch-preferences";

test("normalizeWatchPreferences applies defaults and explicit overrides", () => {
  const preferences = normalizeWatchPreferences({
    isMuted: true,
    notifyOnComment: false
  });

  assert.equal(preferences.isMuted, true);
  assert.equal(preferences.notifyOnComment, false);
  assert.equal(
    preferences.notifyOnOwnerChange,
    DEFAULT_WATCH_PREFERENCES.notifyOnOwnerChange
  );
});

test("muted watchers do not receive watcher notifications", () => {
  assert.equal(
    shouldNotifyWatcher(
      {
        ...DEFAULT_WATCH_PREFERENCES,
        isMuted: true
      },
      "comment"
    ),
    false
  );
});

test("watcher notification preferences are checked per event kind", () => {
  const preferences = {
    ...DEFAULT_WATCH_PREFERENCES,
    notifyOnComment: false,
    notifyOnOwnerChange: true,
    notifyOnWorkflowChange: false,
    notifyOnResolve: true
  };

  assert.equal(shouldNotifyWatcher(preferences, "comment"), false);
  assert.equal(shouldNotifyWatcher(preferences, "owner_change"), true);
  assert.equal(shouldNotifyWatcher(preferences, "workflow_change"), false);
  assert.equal(shouldNotifyWatcher(preferences, "resolve"), true);
});
