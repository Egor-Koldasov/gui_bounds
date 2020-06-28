const state = {
  image: null,
  point: {x: 0, y: 0},
  topLeft: {x: 0, y: 0},
  bottomRight: {x: 0, y: 0},
  activeEdit: null,
};

const editModes = {
  point: {
    button: '.button.point',
    getValue: (state) => state.point,
    setValue: (state, value) => state.point = value,
  },
  topLeft: {
    button: '.button.top-left',
    getValue: (state) => state.topLeft,
    setValue: (state, value) => state.topLeft = value,
  },
  bottomRight: {
    button: '.button.bottom-right',
    getValue: (state) => state.bottomRight,
    setValue: (state, value) => state.bottomRight = value,
  },
}

const imgPathToName = (name) => `../dataset_raw/${name}`;

const openImage = (name) => {
  const path = imgPathToName(name);
  const imgTemplate =
    `<img src="${path}"/>`;
  const containerEl = document.querySelector('.image-container');
  containerEl.innerHTML = imgTemplate;
  state.image = name;
  resetStatsUI(state);
};

const resetEditModeUI = (state) => {
  const staleActiveModeButton = document.querySelector('.button.active');
  if (staleActiveModeButton) staleActiveModeButton.classList.remove('active');
  if (state.activeEdit) {
    const activeModeButton = document.querySelector(editModes[state.activeEdit].button);
    activeModeButton.classList.add('active');
  }
};

const resetStatsUI = (state) => {
  const exportInfoEl = document.querySelector('.export-info');
  const exportData = {
    "name": state.image,
    "tlx": state.topLeft.x, "tly": state.topLeft.y,
    "brx": state.bottomRight.x, "bry": state.bottomRight.y,
  };
  exportInfoEl.value = JSON.stringify(exportData);
}

const resetBoundsUI = (state) => {
  const boundsEl = document.querySelector('.image-editor .bounds-rendered');
  boundsEl.style.left = state.topLeft.x;
  boundsEl.style.top = state.topLeft.y;
  boundsEl.style.width = state.bottomRight.x - state.topLeft.x;
  boundsEl.style.height = state.bottomRight.y - state.topLeft.y;
}

const setEditMode = (name, value) => () => {
  state.activeEdit = (value === false ? null : name);
  resetEditModeUI(state);
}

const init = () => {
  Object.keys(editModes).map((editModeName) => {
    const editMode = editModes[editModeName];
    document.querySelector(editMode.button).addEventListener(
      'click',
      setEditMode(editModeName, state.activeEdit === editModeName ? false : true)
    )
  });
  const containerEl = document.querySelector('.image-container');
  containerEl.addEventListener(
    'click',
    (event) => {
      if (state.activeEdit) {
        const boundingRect = containerEl.getBoundingClientRect();
        const x = Math.round(event.clientX - boundingRect.x);
        const y = Math.round(event.clientY - boundingRect.y);
        editModes[state.activeEdit].setValue(state, {x, y});
        resetStatsUI(state);
        resetBoundsUI(state);
      }
    },
  )

  document.addEventListener(
    'keydown',
    (e) => {
      const editMode = editModes[state.activeEdit];
      const value = editMode.getValue(state);
      const imgRect = containerEl.getBoundingClientRect();
      switch(e.keyCode) {
        case 65:
          editMode.setValue(state, {...value, x: Math.max(0, value.x - 1)})
          break;
        case 87:
          editMode.setValue(state, {...value, y: Math.max(0, value.y - 1)})
          break;
        case 68:
          editMode.setValue(state, {...value, x: Math.min(imgRect.width, value.x + 1)})
          break;
        case 83:
          editMode.setValue(state, {...value, y: Math.min(imgRect.height, value.y + 1)})
          break;
      }
      resetBoundsUI(state);
      resetStatsUI(state);
    }
  )
};

init();